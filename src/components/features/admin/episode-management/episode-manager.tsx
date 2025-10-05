// src/components/features/admin/episode-management/episode-manager.tsx
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
import { EditEpisodeDialog } from "./edit-episode-dialog";
import { EpisodeTablePagination } from "./episode-table-pagination";
import { ConfirmationDialog } from "@/src/components/ui/confirmation-dialog";
import { Card, CardContent } from "@/src/components/ui/card";
import { ListMusic } from "lucide-react";
import { toast } from "sonner";

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

  // UI states
  const [episodeToEdit, setEpisodeToEdit] = useState<Episode | null>(null);
  const [episodeToDelete, setEpisodeToDelete] = useState<Episode | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEpisodes, setSelectedEpisodes] = useState<string[]>([]);

  // Funções para manipular a URL, que é a nova "fonte da verdade"
  const createQueryString = (
    params: Record<string, string | number | null>
  ) => {
    const newSearchParams = new URLSearchParams(searchParams?.toString());
    for (const [key, value] of Object.entries(params)) {
      if (value === null) {
        newSearchParams.delete(key);
      } else {
        newSearchParams.set(key, String(value));
      }
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
    let order = "asc";
    if (currentSort === column && currentOrder === "asc") {
      order = "desc";
    }
    startTransition(() => {
      router.push(
        `${pathname}?${createQueryString({
          sortBy: column || null,
          order: order,
        })}`
      );
    });
  };

  const handlePageChange = (page: number) => {
    startTransition(() => {
      router.push(`${pathname}?${createQueryString({ page: page })}`);
    });
  };

  const handleItemsPerPageChange = (limit: number) => {
    startTransition(() => {
      router.push(
        `${pathname}?${createQueryString({ limit: limit, page: 1 })}`
      );
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

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold">Gerenciador de Episódios</h2>
      </div>
      <EpisodeStats
        totalCount={initialTotalEpisodes}
        publishedCount={initialStatusCounts.published}
        draftCount={initialStatusCounts.draft}
        scheduledCount={initialStatusCounts.scheduled}
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
      {initialEpisodes.length > 0 ? (
        <>
          <EpisodeTable
            episodes={initialEpisodes}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSort={handleSort}
            sortColumn={
              (searchParams.get("sortBy") as keyof Episode) || "published_at"
            }
            sortDirection={
              (searchParams.get("order") as SortDirection) || "desc"
            }
            selectedEpisodes={selectedEpisodes}
            onSelectEpisode={(id) =>
              setSelectedEpisodes((prev) =>
                prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
              )
            }
            onSelectAll={() => {}} // Lógica de selecionar todos precisa ser ajustada se necessário
            onStatusChange={async (episodeId, newStatus) => {
              const result = await updateEpisodeAction(episodeId, {
                status: newStatus,
              });
              if (result.success) {
                toast.success("Status atualizado com sucesso!");
              } else {
                toast.error("Erro ao atualizar status", {
                  description: result.error,
                });
              }
            }}
          />
          <EpisodeTablePagination
            currentPage={Number(searchParams.get("page")) || 1}
            totalCount={initialTotalEpisodes}
            itemsPerPage={Number(searchParams.get("limit")) || 10}
            onPageChange={handlePageChange}
            setItemsPerPage={handleItemsPerPageChange}
          />
        </>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ListMusic className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">
              {hasActiveFilters
                ? "Nenhum episódio encontrado"
                : "Nenhum episódio cadastrado"}
            </h3>
          </CardContent>
        </Card>
      )}
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
