// src/components/features/admin/episode-management/useEpisodesData.ts

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

interface StatusCounts {
  draft: number;
  scheduled: number;
  published: number;
  archived: number;
}

interface UseEpisodesDataReturn {
  episodes: Episode[];
  loading: boolean;
  page: number;
  perPage: number;
  totalFiltered: number;
  statusCounts: StatusCounts | null;
  isPendingTransition: boolean;
  refetch: () => Promise<void>;
  optimisticUpdateStatus: (id: string, newStatus: Episode["status"]) => void;
  optimisticBulkStatus: (
    ids: string[],
    newStatus: Episode["status"]
  ) => Promise<{ ok: number; fail: number }>;
  optimisticDelete: (id: string) => void;
  refreshOne: (id: string) => Promise<void>;
}

export function useEpisodesData(params: any): UseEpisodesDataReturn {
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
  const [statusCounts, setStatusCounts] = useState<StatusCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const mountedRef = useRef(true);
  const inFlightRef = useRef(false);

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

      startTransition(() => {
        if (listRes.success) {
          if (mountedRef.current) {
            setEpisodes(listRes.data);
            setTotalFiltered(listRes.totalFiltered);
          }
        } else {
          toast.error("Erro ao listar episódios", {
            description: listRes.error,
          });
        }

        if (countsRes.success) {
          if (mountedRef.current) {
            setStatusCounts(countsRes.counts as StatusCounts);
          }
        } else {
          toast.error("Erro ao contar status", {
            description: countsRes.error,
          });
        }
      });
    } catch (e: any) {
      startTransition(() => {
        toast.error("Falha inesperada", { description: e?.message });
      });
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

  const optimisticUpdateStatus = useCallback(
    (id: string, newStatus: Episode["status"]) => {
      const prev = [...episodes];
      setEpisodes((cur) =>
        cur.map((e) => (e.id === id ? { ...e, status: newStatus } : e))
      );

      startTransition(async () => {
        const res = await updateEpisodeAction(id, { status: newStatus });
        if (!res.success) {
          toast.error("Falha ao atualizar status", { description: res.error });
          setEpisodes(prev);
        } else {
          toast.success("Status atualizado");
          const prevEp = prev.find((p) => p.id === id);
          if (prevEp && prevEp.status !== newStatus) {
            setStatusCounts((c) =>
              c
                ? {
                    ...c,
                    [prevEp.status]: c[prevEp.status as keyof StatusCounts] - 1,
                    [newStatus]: c[newStatus as keyof StatusCounts] + 1,
                  }
                : c
            );
          }
        }
      });
    },
    [episodes, startTransition]
  );

  const optimisticBulkStatus = useCallback(
    async (ids: string[], newStatus: Episode["status"]) => {
      // Esta função é mais complexa e já retorna Promise, o setTimeout aqui é mais seguro.
      // Manteremos como está para evitar refatoração excessiva.
      const prev = episodes;
      const prevStatusMap: Record<string, Episode["status"]> = {};
      prev.forEach((e) => {
        if (ids.includes(e.id)) prevStatusMap[e.id] = e.status;
      });
      setEpisodes((cur) =>
        cur.map((e) => (ids.includes(e.id) ? { ...e, status: newStatus } : e))
      );

      const results = await Promise.all(
        ids.map((id) =>
          updateEpisodeAction(id, { status: newStatus }).then((r) => r.success)
        )
      );
      const ok = results.filter(Boolean).length;
      const fail = results.length - ok;

      setTimeout(() => {
        if (fail > 0) {
          toast.error("Atualização parcial", {
            description: `${ok} sucesso / ${fail} falha(s)`,
          });
          fetchAll(); // Força a recarga para garantir consistência
        } else {
          toast.success(`Status atualizado para ${ok} episódio(s)`);
          fetchAll();
        }
      }, 50);

      return { ok, fail };
    },
    [episodes, fetchAll]
  );

  const optimisticDelete = useCallback(
    (id: string) => {
      const prev = [...episodes];
      const target = prev.find((e) => e.id === id);
      setEpisodes((cur) => cur.filter((e) => e.id !== id));

      startTransition(async () => {
        const res = await deleteEpisodeAction(id);
        if (!res.success) {
          toast.error("Falha ao deletar", { description: res.error });
          setEpisodes(prev);
        } else {
          toast.success("Episódio deletado");
          if (target) {
            setStatusCounts((c) =>
              c
                ? {
                    ...c,
                    [target.status]: Math.max(
                      0,
                      c[target.status as keyof StatusCounts] - 1
                    ),
                  }
                : c
            );
          }
          setTotalFiltered((t) => Math.max(0, t - 1));
        }
      });
    },
    [episodes, startTransition]
  );

  const refreshOne = useCallback(
    async (_id: string) => {
      await fetchAll();
    },
    [fetchAll]
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
