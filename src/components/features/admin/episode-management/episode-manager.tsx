// src/components/features/admin/episode-management/episode-manager.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Program,
  Episode,
  Category,
  Subcategory,
  SortDirection,
  Tag,
} from "@/src/lib/types";
import {
  deleteEpisode,
  updateEpisode,
  getEpisodesWithRelations,
  getEpisodesCount,
} from "@/src/services/episodeService";
import { getCategories } from "@/src/services/categoryService";
import { getSubcategories } from "@/src/services/subcategoryService";
import { getPrograms } from "@/src/services/programService";
import { getTags } from "@/src/services/tagService";
import {
  getEpisodeStatusCounts,
  getAllEpisodeIds,
} from "@/src/services/adminService";
import { EpisodeTable } from "./episode-table";
import { EpisodeStats } from "./episode-stats";
import { EpisodeFilters } from "./episode-filters";
import { EditEpisodeDialog } from "./edit-episode-dialog";
import { EpisodeTablePagination } from "./episode-table-pagination";
import { EpisodeBulkActions } from "./episode-bulk-actions";
import { ConfirmationDialog } from "@/src/components/ui/confirmation-dialog";
import { Card, CardContent } from "@/src/components/ui/card";
import { ListMusic } from "lucide-react";
import { Skeleton } from "@/src/components/ui/skeleton";
import { toast } from "sonner";

export function EpisodeManager() {
  // Data states
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [totalEpisodes, setTotalEpisodes] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [statusCounts, setStatusCounts] = useState({
    published: 0,
    draft: 0,
    scheduled: 0,
  });

  // UI states
  const [loading, setLoading] = useState(true);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [episodeToEdit, setEpisodeToEdit] = useState<Episode | null>(null);
  const [episodeToDelete, setEpisodeToDelete] = useState<Episode | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEpisodes, setSelectedEpisodes] = useState<string[]>([]);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState<keyof Episode | "">(
    "published_at"
  );
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const offset = (currentPage - 1) * itemsPerPage;
      const [
        episodesResult,
        count,
        categoriesResult,
        subcategoriesResult,
        programsResult,
        statusCountsResult,
        tagsResult,
      ] = await Promise.all([
        getEpisodesWithRelations({
          limit: itemsPerPage,
          offset,
          searchTerm: debouncedSearchTerm,
          status: statusFilter.length > 0 ? statusFilter[0] : "all",
          categoryId: categoryFilter.length > 0 ? categoryFilter[0] : "all",
          sortBy: sortColumn || "published_at",
          ascending: sortDirection === "asc",
        }),
        getEpisodesCount({
          searchTerm: debouncedSearchTerm,
          status: statusFilter.length > 0 ? statusFilter[0] : "all",
          categoryId: categoryFilter.length > 0 ? categoryFilter[0] : "all",
        }),
        getCategories(),
        getSubcategories(),
        getPrograms(),
        getEpisodeStatusCounts(),
        getTags(),
      ]);
      setEpisodes(episodesResult);
      setTotalEpisodes(count);
      setCategories(categoriesResult);
      setSubcategories(subcategoriesResult);
      setPrograms(programsResult);
      setStatusCounts(statusCountsResult);
      setAllTags(tagsResult);
    } catch (err: any) {
      toast.error("Erro ao carregar dados", { description: err.message });
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    itemsPerPage,
    debouncedSearchTerm,
    statusFilter,
    categoryFilter,
    sortColumn,
    sortDirection,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
    try {
      await deleteEpisode(episodeToDelete.id);
      toast.success("Episódio deletado com sucesso.");
      fetchData();
    } catch (error: any) {
      toast.error("Erro ao deletar", { description: error.message });
    } finally {
      setIsDeleteDialogOpen(false);
      setEpisodeToDelete(null);
    }
  };

  const handleUpdateEpisode = async (episodeId: string, updates: any) => {
    try {
      await updateEpisode(episodeId, updates); // Tenta atualizar no banco de dados

      // Se a atualização for bem-sucedida:
      setIsEditDialogOpen(false); // 1. Fecha o pop-up imediatamente

      // 2. Atrasamos a notificação e a busca de dados para o próximo ciclo de renderização,
      //    depois que o pop-up já tiver desaparecido.
      setTimeout(() => {
        toast.success("Episódio atualizado com sucesso.");
        fetchData();
      }, 50);

      return true; // Retorna sucesso
    } catch (error: any) {
      // Se a atualização falhar:
      toast.error("Erro ao atualizar", { description: error.message });
      return false; // Retorna falha
    }
  };

  const handleSelectAll = async (isSelected: boolean) => {
    if (isSelected) {
      try {
        const ids = await getAllEpisodeIds({
          searchTerm: debouncedSearchTerm,
          statusFilter,
          categoryFilter,
        });
        setSelectedEpisodes(ids);
      } catch (error) {
        toast.error("Erro ao selecionar todos");
      }
    } else {
      setSelectedEpisodes([]);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter([]);
    setCategoryFilter([]);
  };
  const hasActiveFilters =
    searchTerm !== "" || statusFilter.length > 0 || categoryFilter.length > 0;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold">Gerenciador de Episódios</h2>
      </div>
      <EpisodeStats
        totalCount={totalEpisodes}
        publishedCount={statusCounts.published}
        draftCount={statusCounts.draft}
        scheduledCount={statusCounts.scheduled}
      />
      <EpisodeFilters
        categories={categories}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        onClearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />
      {episodes.length > 0 ? (
        <>
          <EpisodeTable
            episodes={episodes}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSort={(col) => setSortColumn(col as keyof Episode)}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            selectedEpisodes={selectedEpisodes}
            onSelectEpisode={(id) =>
              setSelectedEpisodes((prev) =>
                prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
              )
            }
            onSelectAll={handleSelectAll}
          />
          <EpisodeTablePagination
            currentPage={currentPage}
            totalCount={totalEpisodes}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            setItemsPerPage={setItemsPerPage}
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
          categories={categories}
          subcategories={subcategories}
          programs={programs}
          allTags={allTags} // CORREÇÃO AQUI: Passando a propriedade com o nome correto 'allTags'
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
