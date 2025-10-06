"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Program,
  Episode,
  Category,
  Subcategory,
  SortDirection,
  Tag,
} from "@/src/lib/types";
import {
  updateEpisodeAction,
  deleteEpisodeAction,
} from "@/src/app/admin/episodes/actions";
import { EpisodeTable } from "./episode-table";
import { EpisodeStats } from "./episode-stats";
import { EpisodeFilters } from "./episode-filters";
import { EditEpisodeDialog } from "./edit/edit-episode-dialog";
import { EpisodeTablePagination } from "./episode-table-pagination";
import { ConfirmationDialog } from "@/src/components/ui/confirmation-dialog";
import { Card, CardContent } from "@/src/components/ui/card";
import { ListMusic } from "lucide-react";
import { toast } from "sonner";
import { BulkStatusBar } from "./bulk-status-bar"; // <-- novo import

interface EpisodeManagerProps {
  initialEpisodes: Episode[];
  initialTotalEpisodes: number;
  initialCategories: Category[];
  initialSubcategories: Subcategory[];
  initialPrograms: Program[];
  initialStatusCounts: { published: number; draft: number; scheduled: number };
  initialAllTags: Tag[];
}

export function EpisodeManager({
  initialEpisodes,
  initialTotalEpisodes,
  initialCategories,
  initialSubcategories,
  initialPrograms,
  initialStatusCounts,
  initialAllTags,
}: EpisodeManagerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [episodeToEdit, setEpisodeToEdit] = useState<Episode | null>(null);
  const [episodeToDelete, setEpisodeToDelete] = useState<Episode | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEpisodes, setSelectedEpisodes] = useState<string[]>([]);

  const createQueryString = (
    params: Record<string, string | number | null>
  ) => {
    const newSearchParams = new URLSearchParams(searchParams?.toString());
    for (const [key, value] of Object.entries(params)) {
      if (value === null) newSearchParams.delete(key);
      else newSearchParams.set(key, String(value));
    }
    return newSearchParams.toString();
  };

  const handleSearch = (term: string) => {
    startTransition(() => {
      router.push(
        `${pathname}?${createQueryString({ q: term || null, page: 1 })}`
      );
    });
  };

  const handleFilterChange = (key: string, value: string[] | string) => {
    startTransition(() => {
      const filterValue = Array.isArray(value) ? value.join(",") : value;
      router.push(
        `${pathname}?${createQueryString({
          [key]: filterValue || null,
          page: 1,
        })}`
      );
    });
  };

  const handleSort = (column: keyof Episode | "") => {
    const currentSort = searchParams.get("sortBy");
    const currentOrder = searchParams.get("order");
    let order: SortDirection = "asc";
    if (currentSort === column && currentOrder === "asc") order = "desc";
    startTransition(() => {
      router.push(
        `${pathname}?${createQueryString({
          sortBy: column || null,
          order,
        })}`
      );
    });
  };

  const handlePageChange = (page: number) => {
    startTransition(() => {
      router.push(`${pathname}?${createQueryString({ page })}`);
    });
  };

  const handleItemsPerPageChange = (limit: number) => {
    startTransition(() => {
      router.push(`${pathname}?${createQueryString({ limit, page: 1 })}`);
    });
  };

  const handleEdit = (episode: Episode) => {
    setEpisodeToEdit(episode);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (episode: Episode) => {
    setEpisodeToDelete(episode);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!episodeToDelete) return;
    const result = await deleteEpisodeAction(episodeToDelete.id);
    if (result.success) {
      toast.success("Episódio deletado com sucesso.");
    } else {
      toast.error("Erro ao deletar", { description: result.error });
    }
    setIsDeleteDialogOpen(false);
    setEpisodeToDelete(null);
  };

  const handleUpdateEpisode = async (
    episodeId: string,
    updates: Partial<Episode>
  ): Promise<boolean> => {
    const result = await updateEpisodeAction(episodeId, updates);
    if (result.success) {
      toast.success("Episódio atualizado com sucesso!");
      setIsEditDialogOpen(false);
      return true;
    } else {
      toast.error("Erro ao atualizar o episódio", {
        description: result.error,
      });
      return false;
    }
  };

  const clearFilters = () => {
    startTransition(() => {
      router.push(pathname);
    });
  };

  const hasActiveFilters = searchParams.toString().length > 0;

  const globalTotal =
    initialStatusCounts.published +
    initialStatusCounts.draft +
    initialStatusCounts.scheduled;

  // Bulk update
  const bulkUpdateStatus = async (
    ids: string[],
    newStatus: Episode["status"]
  ): Promise<{ ok: number; fail: number }> => {
    const results = await Promise.all(
      ids.map(async (id) => {
        const r = await updateEpisodeAction(id, { status: newStatus });
        return r.success;
      })
    );
    const ok = results.filter(Boolean).length;
    const fail = results.length - ok;

    if (ok > 0) {
      startTransition(() => {
        router.refresh();
      });
    }
    return { ok, fail };
  };

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
            totalCount={initialTotalEpisodes}
            publishedCount={initialStatusCounts.published}
            draftCount={initialStatusCounts.draft}
            scheduledCount={initialStatusCounts.scheduled}
            globalTotal={globalTotal}
            showPercentages={false}
            compact={false}
          />

          <EpisodeFilters
            categories={initialCategories}
            searchTerm={searchParams.get("q") || ""}
            setSearchTerm={handleSearch}
            statusFilter={searchParams.get("status")?.split(",") || []}
            setStatusFilter={(value) => handleFilterChange("status", value)}
            categoryFilter={searchParams.get("category")?.split(",") || []}
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
              isPending={isPending}
              topOffsetClass="top-[72px]"
            />
          )}

          {initialEpisodes.length > 0 ? (
            <>
              <EpisodeTable
                episodes={initialEpisodes}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSort={handleSort}
                sortColumn={
                  (searchParams.get("sortBy") as keyof Episode) ||
                  "published_at"
                }
                sortDirection={
                  (searchParams.get("order") as SortDirection) || "desc"
                }
                selectedEpisodes={selectedEpisodes}
                onSelectEpisode={(id: string) =>
                  setSelectedEpisodes((prev) =>
                    prev.includes(id)
                      ? prev.filter((i) => i !== id)
                      : [...prev, id]
                  )
                }
                onSelectAll={(selectAll: boolean) => {
                  if (selectAll) {
                    setSelectedEpisodes(initialEpisodes.map((e) => e.id));
                  } else {
                    setSelectedEpisodes([]);
                  }
                }}
                onStatusChange={async (
                  episodeId: string,
                  newStatus: Episode["status"]
                ) => {
                  const result = await updateEpisodeAction(episodeId, {
                    status: newStatus,
                  });
                  if (result.success) {
                    toast.success("Status atualizado com sucesso!");
                    startTransition(() => router.refresh());
                  } else {
                    toast.error("Erro ao atualizar status", {
                      description: result.error,
                    });
                  }
                }}
                responsiveMode="auto"
                actionsMode="inline-hover"
                primaryAction="edit"
                compactRows
              />
              <EpisodeTablePagination
                currentPage={Number(searchParams.get("page")) || 1}
                totalCount={initialTotalEpisodes}
                itemsPerPage={Number(searchParams.get("limit")) || 5}
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
          description={`Tem certeza que deseja deletar o episódio "${episodeToDelete?.title}"?`}
        />
      )}
    </div>
  );
}
