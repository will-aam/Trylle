"use client";

import { useState, useEffect, useCallback } from "react";
import { EpisodeStats } from "./episode-stats";
import { EpisodeTable } from "./episode-table";
import { EpisodeFilters } from "./episode-filters";
import { EpisodeBulkActions } from "./episode-bulk-actions";
import { Card, CardContent } from "@/src/components/ui/card";
import { ListMusic } from "lucide-react";
import { createClient } from "@/src/lib/supabase-client";
import { Episode, Category, SortDirection } from "@/src/lib/types";
import { toast } from "sonner";
import { EpisodeTablePagination } from "./episode-table-pagination";
import { Skeleton } from "@/src/components/ui/skeleton";

export function EpisodeManager() {
  const supabase = createClient();

  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedEpisodes, setSelectedEpisodes] = useState<string[]>([]);
  const [totalEpisodes, setTotalEpisodes] = useState(0); // Total based on filters
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
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
  const [statusCounts, setStatusCounts] = useState({
    // Global counts, not based on filters
    published: 0,
    draft: 0,
    scheduled: 0,
  });

  const handleSelectEpisode = (episodeId: string) => {
    setSelectedEpisodes((prev) =>
      prev.includes(episodeId)
        ? prev.filter((id) => id !== episodeId)
        : [...prev, episodeId]
    );
  };

  const handleSelectAll = async (isSelected: boolean) => {
    if (isSelected) {
      try {
        let query = supabase.from("episodes").select("id");

        if (debouncedSearchTerm) {
          query = query.ilike("title", `%${debouncedSearchTerm}%`);
        }
        if (statusFilter.length > 0) {
          query = query.in("status", statusFilter);
        }
        if (categoryFilter.length > 0) {
          query = query.in("category_id", categoryFilter);
        }

        const { data, error } = await query;
        if (error) throw error;

        setSelectedEpisodes(data.map((e) => e.id));
      } catch (error) {
        toast.error("Erro ao selecionar todos", {
          description:
            "Não foi possível buscar todos os episódios. Tente novamente.",
        });
      }
    } else {
      setSelectedEpisodes([]);
    }
  };

  const clearSelection = () => {
    setSelectedEpisodes([]);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      // Query 1: Paginated and filtered episodes for the table
      let paginatedEpisodesQuery = supabase
        .from("episodes")
        .select(`*, categories (name), tags:episode_tags (tags (id, name))`, {
          count: "exact",
        });

      if (debouncedSearchTerm) {
        paginatedEpisodesQuery = paginatedEpisodesQuery.ilike(
          "title",
          `%${debouncedSearchTerm}%`
        );
      }
      if (statusFilter.length > 0) {
        paginatedEpisodesQuery = paginatedEpisodesQuery.in(
          "status",
          statusFilter
        );
      }
      if (categoryFilter.length > 0) {
        paginatedEpisodesQuery = paginatedEpisodesQuery.in(
          "category_id",
          categoryFilter
        );
      }

      const finalPaginatedQuery = paginatedEpisodesQuery
        .order(sortColumn || "published_at", {
          ascending: sortDirection === "asc",
        })
        .range(from, to);

      // Query 2: All episodes statuses for the global stats cards (NO FILTERS)
      const totalStatusCountQuery = supabase.from("episodes").select("status");

      // Query 3: All categories for the filter dropdown
      const categoriesQuery = supabase.from("categories").select("*");

      // Execute queries in parallel
      const [paginatedResult, totalStatusCountResult, categoriesResult] =
        await Promise.all([
          finalPaginatedQuery,
          totalStatusCountQuery,
          categoriesQuery,
        ]);

      // Process paginated episodes result
      const {
        data: episodesData,
        error: episodesError,
        count,
      } = paginatedResult;
      if (episodesError) throw episodesError;
      setEpisodes(episodesData as any[]);
      setTotalEpisodes(count || 0);

      // Process global status counts result
      const { data: allStatuses, error: totalStatusCountError } =
        totalStatusCountResult;
      if (totalStatusCountError) throw totalStatusCountError;

      const counts = { published: 0, draft: 0, scheduled: 0 };
      allStatuses.forEach((ep) => {
        if (ep.status === "published") {
          counts.published++;
        } else if (ep.status === "draft") {
          counts.draft++;
        } else if (ep.status === "scheduled") {
          counts.scheduled++;
        }
      });
      setStatusCounts(counts);

      // Process categories result
      const { data: categoriesData, error: categoriesError } = categoriesResult;
      if (categoriesError) throw categoriesError;
      setCategories(categoriesData as Category[]);
    } catch (error: any) {
      toast.error("Erro ao carregar dados", {
        description:
          error.message || "Não foi possível buscar os dados. Tente novamente.",
      });
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [
    supabase,
    currentPage,
    itemsPerPage,
    debouncedSearchTerm,
    statusFilter,
    categoryFilter,
    sortColumn,
    sortDirection,
  ]);

  const handleBulkUpdateStatus = async (newStatus: "published" | "draft") => {
    if (selectedEpisodes.length === 0) return;

    setIsBulkUpdating(true);
    const toastId = toast.loading("Atualizando episódios...", {
      description: `Modificando ${selectedEpisodes.length} item(s). Por favor, aguarde.`,
    });

    try {
      const { error } = await supabase
        .from("episodes")
        .update({ status: newStatus })
        .in("id", selectedEpisodes);

      if (error) throw error;

      toast.success("Sucesso!", {
        id: toastId,
        description: `${selectedEpisodes.length} episódios foram atualizados.`,
      });

      setSelectedEpisodes([]);
      fetchData(); // Recarrega a lista
    } catch (error: any) {
      toast.error("Erro ao atualizar", {
        id: toastId,
        description: error.message || "Ocorreu um erro inesperado.",
      });
      console.error("Error updating episodes:", error);
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const handleSort = (column: keyof Episode) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

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

  useEffect(() => {
    setCurrentPage(1);
  }, [
    debouncedSearchTerm,
    statusFilter,
    categoryFilter,
    sortColumn,
    sortDirection,
    itemsPerPage,
  ]);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter([]);
    setCategoryFilter([]);
    setSortColumn("published_at");
    setSortDirection("desc");
  };

  const hasActiveFilters =
    Boolean(debouncedSearchTerm) ||
    statusFilter.length > 0 ||
    categoryFilter.length > 0;

  if (loading && episodes.length === 0) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-foreground text-balance">
              Gerenciador de Episódios
            </h2>
            <p className="text-muted-foreground mt-2">
              Carregando dados, por favor aguarde...
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground text-balance">
            Gerenciador de Episódios
          </h2>
        </div>
      </div>

      <EpisodeStats
        totalCount={totalEpisodes}
        publishedCount={statusCounts.published}
        draftCount={statusCounts.draft}
        scheduledCount={statusCounts.scheduled}
      />

      {selectedEpisodes.length > 0 ? (
        <EpisodeBulkActions
          selectedCount={selectedEpisodes.length}
          isLoading={isBulkUpdating}
          onPublish={() => handleBulkUpdateStatus("published")}
          onMoveToDraft={() => handleBulkUpdateStatus("draft")}
          onClearSelection={clearSelection}
        />
      ) : (
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
      )}

      {hasActiveFilters && (
        <div className="text-sm text-muted-foreground">
          Mostrando {episodes.length} de {totalEpisodes} episódios encontrados
        </div>
      )}

      {episodes.length > 0 ? (
        <>
          <EpisodeTable
            episodes={episodes}
            setEpisodes={setEpisodes}
            onEpisodeUpdate={fetchData}
            onSort={handleSort}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            selectedEpisodes={selectedEpisodes}
            onSelectEpisode={handleSelectEpisode}
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
            <h3 className="text-lg font-semibold mb-2">
              {hasActiveFilters
                ? "Nenhum episódio encontrado"
                : "Nenhum episódio cadastrado"}
            </h3>
            <p className="text-muted-foreground text-center max-w-md">
              {hasActiveFilters
                ? "Tente ajustar os filtros para encontrar o que você está procurando."
                : "Faça um novo upload para começar a gerenciar seus episódios."}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 text-primary hover:underline"
              >
                Limpar filtros
              </button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
