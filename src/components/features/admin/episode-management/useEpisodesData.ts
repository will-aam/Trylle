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
import { toast } from "@/src/lib/safe-toast";

export interface UseEpisodesDataParams {
  search?: string;
  statusCsv?: string;
  categoryCsv?: string;
  programCsv?: string;
  sortBy?: string;
  order?: string;
  page?: number;
  perPage?: number;
}

interface StatusCounts {
  draft: number;
  scheduled: number;
  published: number;
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
  optimisticUpdateStatus: (id: string, newStatus: Episode["status"]) => void; // Removido Promise<void> para refletir o uso de startTransition
  optimisticBulkStatus: (
    ids: string[],
    newStatus: Episode["status"]
  ) => Promise<{ ok: number; fail: number }>;
  optimisticDelete: (id: string) => void; // Removido Promise<boolean>
  refreshOne: (id: string) => Promise<void>;
}

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

      if (mountedRef.current) {
        startTransition(() => {
          if (listRes.success) {
            if (shallowDiffersEpisodes(listRes.data, episodes)) {
              setEpisodes(listRes.data);
            }
            setTotalFiltered(listRes.totalFiltered);
          } else {
            toast.error("Erro ao listar episódios", {
              description: listRes.error,
            });
          }

          if (countsRes.success) {
            setStatusCounts(countsRes.counts);
          } else {
            toast.error("Erro ao contar status", {
              description: countsRes.error,
            });
          }
        });
      }
    } catch (e: any) {
      if (mountedRef.current) {
        startTransition(() => {
          toast.error("Falha inesperada", { description: e?.message });
        });
      }
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
    startTransition,
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
      const prevEpisodes = [...episodes];
      setEpisodes((current) =>
        current.map((e) => (e.id === id ? { ...e, status: newStatus } : e))
      );

      startTransition(() => {
        (async () => {
          const res = await updateEpisodeAction(id, { status: newStatus });
          if (!res.success) {
            toast.error("Falha ao atualizar status", {
              description: res.error,
            });
            setEpisodes(prevEpisodes); // Rollback
          } else {
            toast.success("Status atualizado");
            // Atualiza contadores
            const prevEp = prevEpisodes.find((p) => p.id === id);
            if (prevEp && prevEp.status !== newStatus) {
              setStatusCounts((c) =>
                c
                  ? {
                      ...c,
                      [prevEp.status]:
                        c[prevEp.status as keyof StatusCounts] - 1,
                      [newStatus]: c[newStatus as keyof StatusCounts] + 1,
                    }
                  : c
              );
            }
          }
        })();
      });
    },
    [episodes, startTransition]
  );

  const optimisticBulkStatus = useCallback(
    async (ids: string[], newStatus: Episode["status"]) => {
      setEpisodes((current) =>
        current.map((e) =>
          ids.includes(e.id) ? { ...e, status: newStatus } : e
        )
      );

      const results = await Promise.all(
        ids.map(async (id) => {
          const r = await updateEpisodeAction(id, { status: newStatus });
          return r.success;
        })
      );

      const ok = results.filter(Boolean).length;
      const fail = results.length - ok;

      // Usar startTransition para a atualização de feedback
      startTransition(() => {
        if (fail > 0) {
          toast.error("Atualização parcial", {
            description: `${ok} sucesso / ${fail} falha(s)`,
          });
        } else {
          toast.success(
            `Status atualizado para ${newStatus} em ${ok} episódio(s)`
          );
        }
        // Recarrega os dados para garantir consistência
        refetch();
      });

      return { ok, fail };
    },
    [refetch, startTransition]
  );

  const optimisticDelete = useCallback(
    (id: string) => {
      const prevEpisodes = [...episodes];
      const target = prevEpisodes.find((e) => e.id === id);
      setEpisodes((current) => current.filter((e) => e.id !== id));

      startTransition(() => {
        (async () => {
          const res = await deleteEpisodeAction(id);
          if (!res.success) {
            toast.error("Falha ao deletar", { description: res.error });
            setEpisodes(prevEpisodes); // Rollback
          } else {
            toast.success("Episódio deletado");
            if (statusCounts && target) {
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
        })();
      });
    },
    [episodes, statusCounts, startTransition]
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
