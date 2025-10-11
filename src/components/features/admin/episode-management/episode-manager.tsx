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

  const handleUpdateEpisode = async (
    episodeId: string,
    updates: Partial<UpdateEpisodeServerInput>
  ): Promise<boolean> => {
    const result = await updateEpisodeAction(episodeId, updates);
    if (result.success) {
      refreshData();
      return true;
    }
    toast({
      title: "Erro ao atualizar episódio",
      description: result.error,
      variant: "destructive",
    });
    return false;
  };

  const handleDelete = async (episode: Episode) => {
    const result = await deleteEpisodeAction(episode.id);
    if (result.success) {
      toast({ title: `Episódio "${episode.title}" excluído.` });
      refreshData();
    } else {
      toast({
        title: "Erro ao excluir",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const handleBulkUpdate = async (
    ids: string[],
    newStatus: Episode["status"]
  ) => {
    let ok = 0;
    let fail = 0;
    await Promise.all(
      ids.map((id) =>
        updateEpisodeAction(id, { status: newStatus }).then((res) => {
          if (res.success) ok++;
          else fail++;
        })
      )
    );
    refreshData();
    return { ok, fail };
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
          onStatusChange={(episodeId, newStatus) =>
            handleUpdateEpisode(episodeId, { status: newStatus })
          }
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
