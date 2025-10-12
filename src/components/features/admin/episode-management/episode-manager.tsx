// src/components/features/admin/episode-management/episode-manager.tsx

"use client";

import {
  useState,
  useEffect,
  useTransition,
  useCallback,
  useMemo,
} from "react";
import {
  Episode,
  Category,
  Subcategory,
  Program,
  Tag,
  SortDirection,
} from "@/src/lib/types";
import {
  listEpisodesAction,
  updateEpisodeAction,
  deleteEpisodeAction,
  getEpisodeStatusCountsAction,
  UpdateEpisodeServerInput,
  scheduleEpisode,
} from "@/src/app/admin/episodes/actions";
import { EpisodeFilters } from "./episode-filters";
import { EpisodeTable } from "./episode-table";
import { EpisodeStats } from "./episode-stats";
import { EpisodeTablePagination } from "./episode-table-pagination";
import { BulkStatusBar } from "./bulk-status-bar";
import { EditEpisodeDialog } from "./edit/edit-episode-dialog";
import { toast as sonnerToast } from "@/src/lib/safe-toast";

type SortableEpisodeColumns =
  | "title"
  | "published_at"
  | "created_at"
  | "status"
  | "episode_number"
  | "view_count";

interface InitialData {
  episodes: Episode[];
  totalCount: number;
}

interface EpisodeManagerProps {
  initialData: InitialData;
  categories: Category[];
  subcategories: Subcategory[];
  programs: Program[];
  allTags: Tag[];
}

export function EpisodeManager({
  initialData,
  categories,
  subcategories,
  programs,
  allTags,
}: EpisodeManagerProps) {
  const [isFetching, startTransition] = useTransition();

  const [episodes, setEpisodes] = useState<Episode[]>(initialData.episodes);
  const [totalCount, setTotalCount] = useState(initialData.totalCount);
  const [statusCounts, setStatusCounts] = useState({
    draft: 0,
    scheduled: 0,
    published: 0,
  });
  const [selectedEpisodes, setSelectedEpisodes] = useState<string[]>([]);
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [sortColumn, setSortColumn] =
    useState<SortableEpisodeColumns>("published_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});

  const sortEpisodesLocal = useCallback(
    (list: Episode[]) => {
      const sorted = [...list];
      const dir = sortDirection === "asc" ? 1 : -1;
      sorted.sort((a, b) => {
        const col = sortColumn;
        const va = (a as any)[col];
        const vb = (b as any)[col];
        if (col === "published_at" || col === "created_at") {
          const da = va ? new Date(va).getTime() : 0;
          const db = vb ? new Date(vb).getTime() : 0;
          if (da === db) return 0;
          return da > db ? dir : -dir;
        }
        if (col === "episode_number" || col === "view_count") {
          const na = typeof va === "number" ? va : parseFloat(va || "0");
          const nb = typeof vb === "number" ? vb : parseFloat(vb || "0");
          if (na === nb) return 0;
          return na > nb ? dir : -dir;
        }
        const sa = (va ?? "").toString().toLowerCase();
        const sb = (vb ?? "").toString().toLowerCase();
        if (sa === sb) return 0;
        return sa > sb ? dir : -dir;
      });
      return sorted;
    },
    [sortColumn, sortDirection]
  );

  const fetchEpisodes = useCallback(() => {
    startTransition(async () => {
      const result = await listEpisodesAction({
        page: currentPage,
        perPage: itemsPerPage,
        search: searchTerm,
        status: statusFilter as any,
        categoryIds: categoryFilter,
        sortBy: sortColumn,
        order: sortDirection,
      });
      if (result.success) {
        setEpisodes(result.data);
        setTotalCount(result.totalFiltered);
      } else {
        sonnerToast.error("Erro ao buscar episódios", {
          description: result.error,
        });
      }
    });
  }, [
    currentPage,
    itemsPerPage,
    searchTerm,
    statusFilter,
    categoryFilter,
    sortColumn,
    sortDirection,
  ]);

  const fetchStatusCounts = useCallback(async () => {
    const result = await getEpisodeStatusCountsAction();
    if (result.success) {
      setStatusCounts(result.counts);
    }
  }, []);

  useEffect(() => {
    fetchEpisodes();
  }, [
    currentPage,
    itemsPerPage,
    searchTerm,
    statusFilter,
    categoryFilter,
    sortColumn,
    sortDirection,
    fetchEpisodes,
  ]);

  useEffect(() => {
    fetchStatusCounts();
  }, [fetchStatusCounts]);

  const hasActiveFilters = useMemo(
    () =>
      searchTerm.length > 0 ||
      statusFilter.length > 0 ||
      categoryFilter.length > 0,
    [searchTerm, statusFilter, categoryFilter]
  );

  const clearAllFilters = () => {
    setSearchTerm("");
    setStatusFilter([]);
    setCategoryFilter([]);
  };

  const handleSort = (column: keyof Episode | "") => {
    const sortableColumn = column as SortableEpisodeColumns;
    if (
      !sortableColumn ||
      ![
        "title",
        "published_at",
        "created_at",
        "status",
        "episode_number",
        "view_count",
      ].includes(sortableColumn)
    )
      return;

    if (sortColumn === sortableColumn) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(sortableColumn);
      setSortDirection("desc");
    }
    setCurrentPage(1);
  };

  // CORREÇÃO AQUI
  const handleUpdateEpisode = (
    episodeId: string,
    updates: Partial<UpdateEpisodeServerInput>
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      const prevEpisodes = [...episodes];
      setIsUpdating((prev) => ({ ...prev, [episodeId]: true }));
      setEpisodes((curr) =>
        sortEpisodesLocal(
          curr.map((ep) =>
            ep.id === episodeId ? ({ ...ep, ...updates } as Episode) : ep
          )
        )
      );

      (async () => {
        const result = await updateEpisodeAction(episodeId, updates);

        startTransition(() => {
          setIsUpdating((prev) => ({ ...prev, [episodeId]: false }));
          if (result.success) {
            sonnerToast.success("Episódio atualizado!");
            fetchStatusCounts();
            resolve(true);
          } else {
            setEpisodes(prevEpisodes);
            sonnerToast.error("Falha ao atualizar", {
              description: (result as any).error || "Erro desconhecido",
            });
            resolve(false);
          }
        });
      })();
    });
  };

  const handleStatusChange = (
    episodeId: string,
    newStatus: Episode["status"]
  ) => {
    handleUpdateEpisode(episodeId, { status: newStatus });
  };

  // CORREÇÃO AQUI
  const handleDelete = (episode: Episode): Promise<boolean> => {
    return new Promise((resolve) => {
      const prevEpisodes = [...episodes];
      const prevTotal = totalCount;
      const isLastItemOnPage = episodes.length === 1 && currentPage > 1;

      setEpisodes((curr) => curr.filter((ep) => ep.id !== episode.id));
      setSelectedEpisodes((prev) => prev.filter((id) => id !== episode.id));
      setTotalCount((c) => Math.max(0, c - 1));
      if (isLastItemOnPage) {
        setCurrentPage((p) => p - 1);
      }

      (async () => {
        const result = await deleteEpisodeAction(episode.id);

        startTransition(() => {
          if (!result.success) {
            setEpisodes(prevEpisodes);
            setTotalCount(prevTotal);
            sonnerToast.error("Falha ao excluir", {
              description: (result as any).error || "Erro ao deletar",
            });
            resolve(false);
          } else {
            sonnerToast.success(`Episódio "${episode.title}" excluído.`);
            fetchStatusCounts();
            if (!isLastItemOnPage) fetchEpisodes();
            resolve(true);
          }
        });
      })();
    });
  };

  // CORREÇÃO AQUI
  const handleScheduleEpisode = (
    episodeId: string,
    publishAtISO: string
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      const prevEpisodes = [...episodes];
      setIsUpdating((prev) => ({ ...prev, [episodeId]: true }));
      setEpisodes((curr) =>
        sortEpisodesLocal(
          curr.map((ep) =>
            ep.id === episodeId
              ? ({
                  ...ep,
                  status: "scheduled",
                  published_at: publishAtISO,
                } as Episode)
              : ep
          )
        )
      );

      (async () => {
        const result = await scheduleEpisode(episodeId, publishAtISO);

        startTransition(() => {
          setIsUpdating((prev) => ({ ...prev, [episodeId]: false }));
          if (result.success) {
            sonnerToast.success("Episódio agendado!");
            fetchStatusCounts();
            fetchEpisodes();
            resolve(true);
          } else {
            setEpisodes(prevEpisodes);
            sonnerToast.error("Falha ao agendar", {
              description: result.error,
            });
            resolve(false);
          }
        });
      })();
    });
  };

  // CORREÇÃO AQUI
  const handleBulkUpdate = (
    ids: string[],
    newStatus: Episode["status"]
  ): Promise<{ ok: number; fail: number }> => {
    return new Promise((resolve) => {
      const prevEpisodes = [...episodes];
      setEpisodes((curr) =>
        sortEpisodesLocal(
          curr.map((ep) =>
            ids.includes(ep.id) ? ({ ...ep, status: newStatus } as Episode) : ep
          )
        )
      );
      ids.forEach((id) => setIsUpdating((prev) => ({ ...prev, [id]: true })));

      (async () => {
        const results = await Promise.all(
          ids.map((id) =>
            updateEpisodeAction(id, { status: newStatus }).then((res) => ({
              id,
              success: res.success,
              error: (res as any).error,
            }))
          )
        );

        startTransition(() => {
          ids.forEach((id) =>
            setIsUpdating((prev) => ({ ...prev, [id]: false }))
          );
          const failedIds = results.filter((r) => !r.success).map((r) => r.id);
          if (failedIds.length > 0) {
            setEpisodes((curr) =>
              sortEpisodesLocal(
                curr.map((ep) =>
                  failedIds.includes(ep.id)
                    ? (prevEpisodes.find((p) => p.id === ep.id) as Episode)
                    : ep
                )
              )
            );
            sonnerToast.error("Falha na atualização em massa", {
              description: `${failedIds.length} de ${ids.length} falharam.`,
            });
          } else {
            sonnerToast.success("Episódios atualizados!");
          }
          fetchStatusCounts();
          resolve({
            ok: results.length - failedIds.length,
            fail: failedIds.length,
          });
        });
      })();
    });
  };

  return (
    <div className="space-y-4">
      <EpisodeStats
        totalCount={totalCount}
        publishedCount={statusCounts.published}
        draftCount={statusCounts.draft}
        scheduledCount={statusCounts.scheduled}
      />
      <EpisodeFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearAllFilters}
        categories={categories}
      />
      {selectedEpisodes.length > 0 && (
        <BulkStatusBar
          selectedCount={selectedEpisodes.length}
          selectedIds={selectedEpisodes}
          onClear={() => setSelectedEpisodes([])}
          onBulkUpdate={handleBulkUpdate}
          isPending={isFetching}
        />
      )}
      <div className="rounded-lg border">
        <EpisodeTable
          episodes={episodes}
          onDelete={handleDelete}
          onSort={handleSort}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          selectedEpisodes={selectedEpisodes}
          onSelectEpisode={(id) =>
            setSelectedEpisodes((prev) =>
              prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
            )
          }
          onSelectAll={(select) =>
            setSelectedEpisodes(select ? episodes.map((e) => e.id) : [])
          }
          onStatusChange={handleStatusChange}
          isUpdating={isUpdating}
          onUpdateEpisode={handleUpdateEpisode}
          onScheduleEpisode={handleScheduleEpisode}
          categories={categories}
          subcategories={subcategories}
          programs={programs}
          allTags={allTags}
        />
      </div>
      <EpisodeTablePagination
        currentPage={currentPage}
        totalCount={totalCount}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        setItemsPerPage={(value) => {
          setItemsPerPage(value);
          setCurrentPage(1);
        }}
        isLoading={isFetching}
      />
      {editingEpisode && (
        <EditEpisodeDialog
          isOpen={!!editingEpisode}
          onOpenChange={(isOpen) => !isOpen && setEditingEpisode(null)}
          episode={editingEpisode}
          categories={categories}
          subcategories={subcategories}
          programs={programs}
          allTags={allTags}
          onUpdate={handleUpdateEpisode}
        />
      )}
    </div>
  );
}
