"use client";

import { useState, useTransition, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Program,
  Episode,
  Category,
  Subcategory,
  SortDirection,
  Tag,
} from "@/src/lib/types";
import { EditEpisodeDialog } from "./edit/edit-episode-dialog";
import { EpisodeTable } from "./episode-table";
import { EpisodeStats } from "./episode-stats";
import { EpisodeFilters } from "./episode-filters";
import { EpisodeTablePagination } from "./episode-table-pagination";
import { ConfirmationDialog } from "@/src/components/ui/confirmation-dialog";
import { Card, CardContent } from "@/src/components/ui/card";
import { ListMusic } from "lucide-react";
import { toast } from "sonner";
import { BulkStatusBar } from "./bulk-status-bar";
import { updateEpisodeAction } from "@/src/app/admin/episodes/actions";
import { useEpisodesData } from "./useEpisodesData";

interface EpisodeManagerProps {
  initialCategories: Category[];
  initialSubcategories: Subcategory[];
  initialPrograms: Program[];
  initialAllTags: Tag[];
}

export function EpisodeManager({
  initialCategories,
  initialSubcategories,
  initialPrograms,
  initialAllTags,
}: EpisodeManagerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPendingNav, startTransition] = useTransition();

  // URL params
  const page = Number(searchParams.get("page")) || 1;
  const perPage = Number(searchParams.get("limit")) || 5;
  const search = searchParams.get("q") || "";
  const statusCsv = searchParams.get("status") || "";
  const categoryCsv = searchParams.get("category") || "";
  const programCsv = searchParams.get("program") || "";
  const sortBy =
    (searchParams.get("sortBy") as keyof Episode) || "published_at";
  const order = (searchParams.get("order") as SortDirection) || "desc";

  const {
    episodes,
    loading,
    totalFiltered,
    statusCounts,
    isPendingTransition,
    refetch,
    optimisticUpdateStatus,
    optimisticBulkStatus,
    optimisticDelete,
  } = useEpisodesData({
    page,
    perPage,
    search,
    statusCsv,
    categoryCsv,
    programCsv,
    sortBy,
    order,
  });

  const [episodeToEdit, setEpisodeToEdit] = useState<Episode | null>(null);
  const [episodeToDelete, setEpisodeToDelete] = useState<Episode | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEpisodes, setSelectedEpisodes] = useState<string[]>([]);

  // Query state helpers
  const createQueryString = (
    params: Record<string, string | number | null>
  ) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(params)) {
      if (value === null) newSearchParams.delete(key);
      else newSearchParams.set(key, String(value));
    }
    return newSearchParams.toString();
  };
  const pushWithParams = (next: Record<string, string | number | null>) =>
    startTransition(() => {
      router.push(`${pathname}?${createQueryString(next)}`);
    });

  // Filtros / Sort / Paginação
  const handleSearch = (term: string) =>
    pushWithParams({ q: term || null, page: 1 });

  const handleFilterChange = (key: string, value: string[] | string) => {
    const v = Array.isArray(value) ? value.join(",") : value;
    pushWithParams({ [key]: v || null, page: 1 });
  };

  const handleSort = (column: keyof Episode | "") => {
    const currentSort = searchParams.get("sortBy");
    const currentOrder = (searchParams.get("order") as SortDirection) || "desc";
    let newOrder: SortDirection = "asc";
    if (currentSort === column && currentOrder === "asc") newOrder = "desc";
    pushWithParams({ sortBy: column || null, order: newOrder });
  };

  const handlePageChange = (p: number) => pushWithParams({ page: p });
  const handleItemsPerPageChange = (limit: number) =>
    pushWithParams({ limit, page: 1 });

  // CRUD UI
  const handleEdit = (ep: Episode) => {
    setEpisodeToEdit(ep);
    setIsEditDialogOpen(true);
  };
  const handleDelete = (ep: Episode) => {
    setEpisodeToDelete(ep);
    setIsDeleteDialogOpen(true);
  };
  const confirmDelete = async () => {
    if (!episodeToDelete) return;
    await optimisticDelete(episodeToDelete.id);
    setSelectedEpisodes((prev) =>
      prev.filter((id) => id !== episodeToDelete.id)
    );
    setEpisodeToDelete(null);
    setIsDeleteDialogOpen(false);
  };

  const handleUpdateEpisode = async (
    episodeId: string,
    updates: Partial<{
      title: string;
      description: string | null;
      program_id: string | null;
      episode_number: number;
      category_id: string;
      subcategory_id: string | null;
      tags: string[];
    }>
  ) => {
    const res = await updateEpisodeAction(episodeId, updates);
    if (res.success) {
      toast.success("Episódio atualizado com sucesso!");
      setIsEditDialogOpen(false);
      await refetch();
      return true;
    } else {
      toast.error("Erro ao atualizar episódio", {
        description: res.error,
      });
      return false;
    }
  };

  const clearFilters = () => startTransition(() => router.push(pathname));
  const hasActiveFilters = searchParams.toString().length > 0;

  const effectiveStatusCounts = statusCounts || {
    published: 0,
    draft: 0,
    scheduled: 0,
  };
  const globalTotal =
    effectiveStatusCounts.published +
    effectiveStatusCounts.draft +
    effectiveStatusCounts.scheduled;

  const bulkUpdateStatus = async (
    ids: string[],
    newStatus: Episode["status"]
  ) => optimisticBulkStatus(ids, newStatus);

  // Lista final (sem fallback de initialEpisodes agora)
  const tableEpisodes = useMemo(() => episodes, [episodes]);

  return (
    <div className="w-full">
      <div className="mx-auto max-w-screen-2xl px-4 py-6 lg:py-8">
        <div className="mb-6 flex flex-col gap-2 lg:mb-8">
          <h2 className="text-3xl font-bold tracking-tight">
            Gerenciador de Episódios
          </h2>
          <p className="text-sm text-muted-foreground">
            Busque, filtre, edite e gerencie a publicação dos episódios.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <EpisodeStats
            totalCount={totalFiltered}
            publishedCount={effectiveStatusCounts.published}
            draftCount={effectiveStatusCounts.draft}
            scheduledCount={effectiveStatusCounts.scheduled}
            globalTotal={globalTotal}
            showPercentages={false}
            compact={false}
          />

          <EpisodeFilters
            categories={initialCategories}
            searchTerm={search}
            setSearchTerm={handleSearch}
            statusFilter={statusCsv ? statusCsv.split(",").filter(Boolean) : []}
            setStatusFilter={(value) => handleFilterChange("status", value)}
            categoryFilter={
              categoryCsv ? categoryCsv.split(",").filter(Boolean) : []
            }
            setCategoryFilter={(value) => handleFilterChange("category", value)}
            onClearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters}
          />

          {selectedEpisodes.length > 0 && (
            <BulkStatusBar
              selectedCount={selectedEpisodes.length}
              selectedIds={selectedEpisodes}
              onClear={() => setSelectedEpisodes([])}
              onBulkUpdate={bulkUpdateStatus}
              isPending={isPendingTransition || loading || isPendingNav}
              topOffsetClass="top-[72px]"
            />
          )}

          {tableEpisodes.length > 0 ? (
            <>
              <EpisodeTable
                episodes={tableEpisodes}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSort={handleSort}
                sortColumn={sortBy}
                sortDirection={order}
                selectedEpisodes={selectedEpisodes}
                onSelectEpisode={(id) =>
                  setSelectedEpisodes((prev) =>
                    prev.includes(id)
                      ? prev.filter((i) => i !== id)
                      : [...prev, id]
                  )
                }
                onSelectAll={(sel) =>
                  setSelectedEpisodes(sel ? tableEpisodes.map((e) => e.id) : [])
                }
                onStatusChange={(id, newStatus) =>
                  optimisticUpdateStatus(id, newStatus)
                }
                responsiveMode="auto"
                actionsMode="inline-hover"
                primaryAction="edit"
                compactRows
                categories={[]}
                subcategories={[]}
                programs={[]}
                allTags={[]}
              />
              <EpisodeTablePagination
                currentPage={page}
                totalCount={totalFiltered}
                itemsPerPage={perPage}
                onPageChange={handlePageChange}
                setItemsPerPage={handleItemsPerPageChange}
              />
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <ListMusic className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="text-lg font-semibold">
                  {hasActiveFilters
                    ? "Nenhum episódio encontrado"
                    : "Nenhum episódio cadastrado"}
                </h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 text-sm font-medium text-primary hover:underline"
                  >
                    Limpar filtros
                  </button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {isEditDialogOpen && episodeToEdit && (
        <EditEpisodeDialog
          episode={episodeToEdit}
          categories={initialCategories}
          subcategories={initialSubcategories}
          programs={initialPrograms}
          allTags={initialAllTags}
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onUpdate={handleUpdateEpisode}
        />
      )}

      {isDeleteDialogOpen && episodeToDelete && (
        <ConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={confirmDelete}
          title="Confirmar Exclusão"
          description={`Deseja realmente excluir o episódio "${episodeToDelete.title}"?`}
        />
      )}
    </div>
  );
}
