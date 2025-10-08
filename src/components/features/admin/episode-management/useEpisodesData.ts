"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
  useMemo,
} from "react";
import {
  listEpisodesAction,
  getEpisodeStatusCountsAction,
  updateEpisodeAction,
  deleteEpisodeAction,
} from "@/src/app/admin/episodes/actions";
import { Episode } from "@/src/lib/types";
import { toast } from "sonner";

export interface UseEpisodesDataParams {
  search?: string;
  statusCsv?: string; // ex: "published,draft"
  categoryCsv?: string; // ex: "cat1,cat2"
  programCsv?: string;
  sortBy?: string;
  order?: string;
  page?: number;
  perPage?: number;
}

interface UseEpisodesDataReturn {
  episodes: Episode[];
  loading: boolean;
  page: number;
  perPage: number;
  totalFiltered: number;
  statusCounts: { draft: number; scheduled: number; published: number } | null;
  isPendingTransition: boolean;
  refetch: () => Promise<void>;
  optimisticUpdateStatus: (
    id: string,
    newStatus: Episode["status"]
  ) => Promise<void>;
  optimisticBulkStatus: (
    ids: string[],
    newStatus: Episode["status"]
  ) => Promise<{ ok: number; fail: number }>;
  optimisticDelete: (id: string) => Promise<boolean>;
  refreshOne: (id: string) => Promise<void>;
}

/**
 * Hook para centralizar listagem e operações de episódios via Server Actions.
 * Corrigido para evitar loop infinito (arrays memorizados + guard de requisição).
 */
export function useEpisodesData(
  params: UseEpisodesDataParams
): UseEpisodesDataReturn {
  const {
    search = "",
    statusCsv = "",
    categoryCsv = "",
    programCsv = "",
    sortBy = "published_at",
    order = "desc",
    page = 1,
    perPage = 10,
  } = params;

  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [totalFiltered, setTotalFiltered] = useState(0);
  const [statusCounts, setStatusCounts] = useState<{
    draft: number;
    scheduled: number;
    published: number;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const mountedRef = useRef(true);
  const inFlightRef = useRef(false); // evita requisições sobrepostas

  // Memorizar arrays para não recriarem referência a cada render
  const statusArray = useMemo(
    () =>
      statusCsv
        ? (statusCsv.split(",").filter(Boolean) as Episode["status"][])
        : [],
    [statusCsv]
  );
  const categoryIds = useMemo(
    () => (categoryCsv ? categoryCsv.split(",").filter(Boolean) : []),
    [categoryCsv]
  );
  const programIds = useMemo(
    () => (programCsv ? programCsv.split(",").filter(Boolean) : []),
    [programCsv]
  );

  // Função util para comparar shallow (evitar setState redundante)
  function shallowDiffersEpisodes(a: Episode[], b: Episode[]) {
    if (a.length !== b.length) return true;
    for (let i = 0; i < a.length; i++) {
      if (a[i].id !== b[i].id || a[i].updated_at !== b[i].updated_at) {
        return true;
      }
    }
    return false;
  }

  const fetchAll = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setLoading(true);
    try {
      const [listRes, countsRes] = await Promise.all([
        listEpisodesAction({
          page,
          perPage,
          search,
          status: statusArray,
          categoryIds,
          programIds,
          sortBy: sortBy as any,
          order: order === "asc" ? "asc" : "desc",
          includeTags: true,
          includeDocuments: true,
        }),
        getEpisodeStatusCountsAction(),
      ]);

      if (listRes.success) {
        if (
          mountedRef.current &&
          shallowDiffersEpisodes(listRes.data, episodes)
        ) {
          setEpisodes(listRes.data);
          setTotalFiltered(listRes.totalFiltered);
        } else if (mountedRef.current) {
          // garantir total mesmo que episódios iguais
          setTotalFiltered(listRes.totalFiltered);
        }
      } else {
        toast.error("Erro ao listar episódios", { description: listRes.error });
      }

      if (countsRes.success) {
        if (mountedRef.current) {
          setStatusCounts(countsRes.counts);
        }
      } else {
        toast.error("Erro ao contar status", { description: countsRes.error });
      }
    } catch (e: any) {
      toast.error("Falha inesperada", { description: e?.message });
    } finally {
      if (mountedRef.current) setLoading(false);
      inFlightRef.current = false;
    }
  }, [
    page,
    perPage,
    search,
    statusArray,
    categoryIds,
    programIds,
    sortBy,
    order,
    episodes, // usamos para shallowDiff
  ]);

  useEffect(() => {
    mountedRef.current = true;
    fetchAll();
    return () => {
      mountedRef.current = false;
    };
  }, [fetchAll]);

  const refetch = useCallback(async () => {
    await fetchAll();
  }, [fetchAll]);

  /* ---------- Operações Otimistas ---------- */

  const optimisticUpdateStatus = useCallback(
    async (id: string, newStatus: Episode["status"]) => {
      const prev = episodes;
      setEpisodes((cur) =>
        cur.map((e) => (e.id === id ? { ...e, status: newStatus } : e))
      );
      const res = await updateEpisodeAction(id, { status: newStatus });
      if (!res.success) {
        toast.error("Falha ao atualizar status", { description: res.error });
        setEpisodes(prev); // rollback
      } else {
        toast.success("Status atualizado");
        // Ajusta contadores localmente
        if (statusCounts) {
          const prevEp = prev.find((p) => p.id === id);
          if (prevEp && prevEp.status !== newStatus) {
            setStatusCounts((c) =>
              c
                ? {
                    ...c,
                    [prevEp.status]: c[prevEp.status] - 1,
                    [newStatus]: c[newStatus] + 1,
                  }
                : c
            );
          }
        }
      }
    },
    [episodes, statusCounts]
  );

  const optimisticBulkStatus = useCallback(
    async (ids: string[], newStatus: Episode["status"]) => {
      const prev = episodes;
      const prevStatusMap: Record<string, Episode["status"]> = {};
      prev.forEach((e) => {
        if (ids.includes(e.id)) prevStatusMap[e.id] = e.status;
      });

      setEpisodes((cur) =>
        cur.map((e) => (ids.includes(e.id) ? { ...e, status: newStatus } : e))
      );

      const results = await Promise.all(
        ids.map(async (id) => {
          const r = await updateEpisodeAction(id, { status: newStatus });
          return r.success;
        })
      );
      const ok = results.filter(Boolean).length;
      const fail = results.length - ok;

      if (fail > 0) {
        const failedIds = ids.filter((_, idx) => !results[idx]);
        setEpisodes((cur) =>
          cur.map((e) =>
            failedIds.includes(e.id) ? { ...e, status: prevStatusMap[e.id] } : e
          )
        );
        toast.error("Atualização parcial", {
          description: `${ok} sucesso / ${fail} falha(s)`,
        });
      } else {
        toast.success(
          `Status atualizado para ${newStatus} em ${ok} episódio(s)`
        );
      }

      if (statusCounts) {
        const delta: Record<string, number> = {
          draft: 0,
          scheduled: 0,
          published: 0,
        };
        ids.forEach((id, idx) => {
          if (!results[idx]) return;
          const oldS = prevStatusMap[id];
          if (oldS !== newStatus) {
            delta[oldS] -= 1;
            delta[newStatus] += 1;
          }
        });
        setStatusCounts((c) =>
          c
            ? {
                draft: c.draft + delta.draft,
                scheduled: c.scheduled + delta.scheduled,
                published: c.published + delta.published,
              }
            : c
        );
      }

      return { ok, fail };
    },
    [episodes, statusCounts]
  );

  const optimisticDelete = useCallback(
    async (id: string) => {
      const prev = episodes;
      const target = prev.find((e) => e.id === id);
      setEpisodes((cur) => cur.filter((e) => e.id !== id));
      const res = await deleteEpisodeAction(id);
      if (!res.success) {
        toast.error("Falha ao deletar", { description: res.error });
        setEpisodes(prev);
        return false;
      } else {
        toast.success("Episódio deletado");
        if (statusCounts && target) {
          setStatusCounts((c) =>
            c
              ? {
                  ...c,
                  [target.status]: Math.max(0, c[target.status] - 1),
                }
              : c
          );
        }
        setTotalFiltered((t) => Math.max(0, t - 1));
        return true;
      }
    },
    [episodes, statusCounts]
  );

  const refreshOne = useCallback(
    async (_id: string) => {
      await refetch();
    },
    [refetch]
  );

  return {
    episodes,
    loading,
    page,
    perPage,
    totalFiltered,
    statusCounts,
    isPendingTransition: isPending,
    refetch,
    optimisticUpdateStatus,
    optimisticBulkStatus,
    optimisticDelete,
    refreshOne,
  };
}
