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
import { useToast } from "@/src/hooks/use-toast";
import {
  listEpisodesAction,
  updateEpisodeAction,
  deleteEpisodeAction,
  getEpisodeStatusCountsAction,
  UpdateEpisodeServerInput,
  scheduleEpisode, // <- action para agendar
} from "@/src/app/admin/episodes/actions";
import { EpisodeFilters } from "./episode-filters";
import { EpisodeTable } from "./episode-table";
import { EpisodeStats } from "./episode-stats";
import { EpisodeTablePagination } from "./episode-table-pagination";
import { BulkStatusBar } from "./bulk-status-bar";
import { EditEpisodeDialog } from "./edit/edit-episode-dialog";
import { toast as sonnerToast } from "sonner";

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
  const { toast } = useToast();
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

  // Mapa de atualização por episódio (spinner/disable)
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});

  // Helper: ordena localmente respeitando sort atual
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
        toast({
          title: "Erro ao buscar episódios",
          description: result.error,
          variant: "destructive",
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
    toast,
  ]);

  const fetchStatusCounts = useCallback(async () => {
    const result = await getEpisodeStatusCountsAction();
    if (result.success) {
      setStatusCounts(result.counts);
    }
  }, []);

  const refreshData = useCallback(() => {
    fetchEpisodes();
    fetchStatusCounts();
  }, [fetchEpisodes, fetchStatusCounts]);

  useEffect(() => {
    refreshData();
  }, [
    currentPage,
    itemsPerPage,
    searchTerm,
    statusFilter,
    categoryFilter,
    sortColumn,
    sortDirection,
    refreshData,
  ]);

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

  // Atualização otimista genérica (edição/status) com startTransition para evitar o erro do React
  const handleUpdateEpisode = async (
    episodeId: string,
    updates: Partial<UpdateEpisodeServerInput>
  ): Promise<boolean> => {
    const prevEpisodes = [...episodes];

    // Otimista imediato
    setIsUpdating((prev) => ({ ...prev, [episodeId]: true }));
    setEpisodes((curr) =>
      sortEpisodesLocal(
        curr.map((ep) =>
          ep.id === episodeId ? ({ ...ep, ...updates } as Episode) : ep
        )
      )
    );

    // Chamada de servidor + toasts dentro de transition
    startTransition(async () => {
      try {
        const result = await updateEpisodeAction(episodeId, updates);
        if (result.success) {
          sonnerToast.success("Episódio atualizado com sucesso!");
          fetchStatusCounts(); // background
        } else {
          throw new Error(result.error);
        }
      } catch (error: any) {
        // Reversão
        setEpisodes(prevEpisodes);
        toast({
          title: "Erro ao atualizar episódio",
          description: error?.message || "Tente novamente.",
          variant: "destructive",
        });
      } finally {
        setIsUpdating((prev) => ({ ...prev, [episodeId]: false }));
      }
    });

    // Retorna true de forma otimista para fechar diálogos
    return true;
  };

  const handleStatusChange = async (
    episodeId: string,
    newStatus: Episode["status"]
  ) => {
    await handleUpdateEpisode(episodeId, { status: newStatus });
  };

  // Remoção otimista com transition
  const handleDelete = async (episode: Episode) => {
    const prevEpisodes = [...episodes];
    const prevTotal = totalCount;
    const isLastItemOnPage = episodes.length === 1;

    // Otimista
    setEpisodes((curr) => curr.filter((ep) => ep.id !== episode.id));
    setSelectedEpisodes((prev) => prev.filter((id) => id !== episode.id));
    setTotalCount((c) => Math.max(0, c - 1));
    if (isLastItemOnPage && currentPage > 1) {
      setCurrentPage((p) => p - 1);
    }

    startTransition(async () => {
      try {
        const result = await deleteEpisodeAction(episode.id);
        if (result.success) {
          sonnerToast.success(`Episódio "${episode.title}" excluído.`);
          fetchStatusCounts();
          if (!isLastItemOnPage) fetchEpisodes();
        } else {
          throw new Error(result.error);
        }
      } catch (error: any) {
        // Reverte
        setEpisodes(prevEpisodes);
        setTotalCount(prevTotal);
        toast({
          title: "Erro ao excluir",
          description: error?.message || "Tente novamente.",
          variant: "destructive",
        });
      }
    });
  };

  // Agendamento otimista com transition
  const handleScheduleEpisode = (episodeId: string, publishAtISO: string) => {
    const prevEpisodes = [...episodes];

    // Otimista: status + published_at
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

    startTransition(async () => {
      try {
        // scheduleEpisode não retorna { success, error }; tratar erro via catch
        await scheduleEpisode(episodeId, publishAtISO);
        sonnerToast.success("Episódio agendado com sucesso!");
        fetchStatusCounts();
      } catch (error: any) {
        // Reversão
        setEpisodes(prevEpisodes);
        toast({
          title: "Erro ao agendar",
          description: error?.message || "Tente novamente.",
          variant: "destructive",
        });
      } finally {
        setIsUpdating((prev) => ({ ...prev, [episodeId]: false }));
      }
    });
  };

  // Bulk update otimista com transition e reversão granular
  const handleBulkUpdate = async (
    ids: string[],
    newStatus: Episode["status"]
  ) => {
    const prevEpisodes = [...episodes];

    // Otimista
    setEpisodes((curr) =>
      sortEpisodesLocal(
        curr.map((ep) =>
          ids.includes(ep.id) ? ({ ...ep, status: newStatus } as Episode) : ep
        )
      )
    );
    ids.forEach((id) =>
      setIsUpdating((prev) => ({
        ...prev,
        [id]: true,
      }))
    );

    startTransition(async () => {
      const results = await Promise.all(
        ids.map((id) =>
          updateEpisodeAction(id, { status: newStatus }).then((res) => ({
            id,
            success: res.success,
            error: res.success ? "" : res.error,
          }))
        )
      );

      ids.forEach((id) =>
        setIsUpdating((prev) => ({
          ...prev,
          [id]: false,
        }))
      );

      const failedIds = results.filter((r) => !r.success).map((r) => r.id);
      const ok = results.length - failedIds.length;
      const fail = failedIds.length;

      if (fail > 0) {
        // Reversão apenas para os que falharam
        setEpisodes((curr) =>
          sortEpisodesLocal(
            curr.map((ep) =>
              failedIds.includes(ep.id)
                ? ({
                    ...ep,
                    status: (prevEpisodes.find((p) => p.id === ep.id)?.status ??
                      ep.status) as Episode["status"],
                  } as Episode)
                : ep
            )
          )
        );
        toast({
          title: "Falha ao atualizar em massa",
          description: `${fail} de ${ids.length} atualizações falharam.`,
          variant: "destructive",
        });
      } else {
        sonnerToast.success("Episódios atualizados com sucesso!");
      }

      fetchStatusCounts();
    });

    return { ok: 0, fail: 0 };
  };

  useEffect(() => {
    setSelectedEpisodes([]);
  }, [episodes]);

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
          onEdit={setEditingEpisode}
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
          onUpdateEpisode={(id, u) => handleUpdateEpisode(id, u as any)}
          // Conecta agendamento
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
