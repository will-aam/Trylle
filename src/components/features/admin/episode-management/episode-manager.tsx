"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { EpisodeStats } from "./episode-stats";
import { EpisodeTable } from "./episode-table";
import { EpisodeFilters } from "./episode-filters";
import { Card, CardContent } from "@/src/components/ui/card";
import { ListMusic } from "lucide-react";
import { createClient } from "@/src/lib/supabase-client";
import { Episode, Category } from "@/src/lib/types";
import { useToast } from "@/src/hooks/use-toast";
import { EpisodeTablePagination } from "./episode-table-pagination";

const ITEMS_PER_PAGE = 10; // Define quantos episódios por página

export function EpisodeManager() {
  const supabase = createClient();
  const { toast } = useToast();

  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [totalEpisodes, setTotalEpisodes] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Efeito para aplicar o "debounce"
  useEffect(() => {
    // Inicia um timer sempre que o 'searchTerm' mudar
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // Atraso de 500ms

    // Limpa o timer anterior se o usuário digitar novamente antes dos 500ms
    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]); // Roda este efeito apenas quando o searchTerm muda

  const fetchEpisodesAndCategories = useCallback(async () => {
    setLoading(true);
    try {
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let episodeQuery = supabase
        .from("episodes")
        .select(`*, categories (name), tags:episode_tags (tags (id, name))`, {
          count: "exact",
        });

      // MODIFICADO: A query agora usa o 'debouncedSearchTerm'
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
        .order("created_at", { ascending: false })
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
  ]); // MODIFICADO: A dependência agora é o 'debouncedSearchTerm'

  useEffect(() => {
    fetchEpisodesAndCategories();
  }, [fetchEpisodesAndCategories]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, statusFilter, categoryFilter]); // MODIFICADO: Reseta a página com base no 'debouncedSearchTerm'

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter([]);
    setCategoryFilter([]);
  };

  const hasActiveFilters =
    Boolean(searchTerm) || statusFilter.length > 0 || categoryFilter.length > 0;

  if (loading && episodes.length === 0) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-foreground text-balance">
              Gerenciador de Episódios
            </h2>
            <p className="text-muted-foreground mt-2">Carregando dados...</p>
          </div>
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
          <p className="text-muted-foreground mt-2">
            Um centro de comando para todo o seu conteúdo de áudio.
          </p>
        </div>
      </div>

      <EpisodeStats episodes={episodes} />

      <EpisodeFilters
        categories={categories}
        searchTerm={searchTerm} // O input ainda reflete o 'searchTerm' para ser instantâneo
        setSearchTerm={setSearchTerm} // O input ainda atualiza o 'searchTerm'
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        onClearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />

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
          />
          <EpisodeTablePagination
            currentPage={currentPage}
            totalCount={totalEpisodes}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
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
