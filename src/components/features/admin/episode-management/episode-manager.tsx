"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { EpisodeStats } from "./episode-stats";
import { EpisodeTable } from "./episode-table";
import { EpisodeFilters } from "./episode-filters";
import { EpisodeBulkActions } from "./episode-bulk-actions";
import { Card, CardContent } from "@/src/components/ui/card";
import { ListMusic } from "lucide-react";
import { createClient } from "@/src/lib/supabase-client";
import { Episode, Category, SortDirection } from "@/src/lib/types";
import { useToast } from "@/src/hooks/use-toast";
import { EpisodeTablePagination } from "./episode-table-pagination";
import { Skeleton } from "@/src/components/ui/skeleton";

export function EpisodeManager() {
  const supabase = createClient();
  const { toast } = useToast();

  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedEpisodes, setSelectedEpisodes] = useState<string[]>([]);
  const [totalEpisodes, setTotalEpisodes] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
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

  const handleSelectEpisode = (episodeId: string) => {
    setSelectedEpisodes((prev) =>
      prev.includes(episodeId)
        ? prev.filter((id) => id !== episodeId)
        : [...prev, episodeId]
    );
  };

  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedEpisodes(episodes.map((e) => e.id));
    } else {
      setSelectedEpisodes([]);
    }
  };

  const clearSelection = () => {
    setSelectedEpisodes([]);
  };

  const handleBulkUpdateStatus = async (newStatus: "published" | "draft") => {
    if (selectedEpisodes.length === 0) return;

    try {
      const { error } = await supabase
        .from("episodes")
        .update({ status: newStatus })
        .in("id", selectedEpisodes);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: `Episódios atualizados para ${
          newStatus === "published" ? "publicado" : "rascunho"
        }.`,
        variant: "default",
      });
      setSelectedEpisodes([]);
      fetchEpisodesAndCategories();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar episódios",
        description:
          "Não foi possível atualizar os episódios selecionados. Tente novamente.",
        variant: "destructive",
      });
      console.error("Error updating episodes:", error);
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

  const fetchEpisodesAndCategories = useCallback(async () => {
    setLoading(true);
    try {
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      let episodeQuery = supabase
        .from("episodes")
        .select(`*, categories (name), tags:episode_tags (tags (id, name))`, {
          count: "exact",
        });

      if (debouncedSearchTerm) {
        episodeQuery = episodeQuery.ilike("title", `%${debouncedSearchTerm}%`);
      }
      if (statusFilter.length > 0) {
        episodeQuery = episodeQuery.in("status", statusFilter);
      }
      if (categoryFilter.length > 0) {
        episodeQuery = episodeQuery.in("category_id", categoryFilter);
      }

      const {
        data: episodesData,
        error: episodesError,
        count,
      } = await episodeQuery
        .order(sortColumn || "published_at", {
          ascending: sortDirection === "asc",
        })
        .range(from, to);

      if (episodesError) throw episodesError;

      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("*");

      if (categoriesError) throw categoriesError;

      setEpisodes(episodesData as any[]);
      setTotalEpisodes(count || 0);
      setCategories(categoriesData as Category[]);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível buscar os episódios. Tente novamente.",
        variant: "destructive",
      });
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [
    supabase,
    toast,
    currentPage,
    debouncedSearchTerm,
    statusFilter,
    categoryFilter,
    sortColumn,
    sortDirection,
    itemsPerPage,
  ]);

  useEffect(() => {
    fetchEpisodesAndCategories();
  }, [fetchEpisodesAndCategories]);

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

      <EpisodeStats episodes={episodes} />

      {selectedEpisodes.length > 0 ? (
        <EpisodeBulkActions
          selectedCount={selectedEpisodes.length}
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
            onEpisodeUpdate={fetchEpisodesAndCategories}
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
