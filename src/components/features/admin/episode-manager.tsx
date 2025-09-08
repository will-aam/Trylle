"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
// O import do EpisodeStats e EpisodeTable agora deve apontar para o caminho correto
import { EpisodeStats } from "./episode-management/episode-stats";
import { EpisodeTable } from "./episode-management/episode-table";
import { EpisodeFilters } from "./episode-management/episode-filters";
import { Card, CardContent } from "@/src/components/ui/card";
import { ListMusic } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { createClient } from "@/src/lib/supabase-client";
import { Episode, Category } from "@/src/lib/types"; // Importa os tipos corretos
import { useToast } from "@/src/hooks/use-toast";

export function EpisodeManager() {
  const supabase = createClient();
  const { toast } = useToast();

  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);

  const fetchEpisodesAndCategories = useCallback(async () => {
    setLoading(true);
    try {
      const episodesPromise = supabase
        .from("episodes")
        .select(`*, categories (name), tags:episode_tags (tags (id, name))`); // Query ajustada para tags

      const categoriesPromise = supabase.from("categories").select("*");

      const [episodesResult, categoriesResult] = await Promise.all([
        episodesPromise,
        categoriesPromise,
      ]);

      if (episodesResult.error) throw episodesResult.error;
      if (categoriesResult.error) throw categoriesResult.error;

      setEpisodes(episodesResult.data as any[]); // O 'any' é temporário, o Supabase infere o tipo
      setCategories(categoriesResult.data as Category[]);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados",
        description:
          "Não foi possível buscar os episódios e categorias. Tente novamente.",
        variant: "destructive",
      });
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase, toast]);

  useEffect(() => {
    fetchEpisodesAndCategories();
  }, [fetchEpisodesAndCategories]);

  const filteredEpisodes = useMemo(() => {
    return episodes.filter((episode: any) => {
      // Usamos 'any' aqui para facilitar a filtragem
      const matchesSearch =
        episode.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (episode.tags &&
          episode.tags.some((tagObj: any) =>
            tagObj.tags.name.toLowerCase().includes(searchTerm.toLowerCase())
          ));

      const matchesStatus =
        statusFilter.length === 0 || statusFilter.includes(episode.status);

      const matchesCategory =
        categoryFilter.length === 0 ||
        (episode.category_id && categoryFilter.includes(episode.category_id));

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [episodes, searchTerm, statusFilter, categoryFilter]);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter([]);
    setCategoryFilter([]);
  };

  const hasActiveFilters =
    Boolean(searchTerm) || statusFilter.length > 0 || categoryFilter.length > 0;

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-foreground text-balance">
              Gerenciador de Episódios
            </h2>
            <p className="text-muted-foreground mt-2">Carregando dados...</p>
          </div>
          <Button disabled>Fazer Novo Upload</Button>
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
        <Button>Fazer Novo Upload</Button>
      </div>

      {/* O componente EpisodeStats também precisa ser ajustado para receber o tipo correto */}
      {/* <EpisodeStats episodes={episodes} /> */}

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

      {hasActiveFilters && (
        <div className="text-sm text-muted-foreground">
          Mostrando {filteredEpisodes.length} de {episodes.length} episódios
        </div>
      )}

      {filteredEpisodes.length > 0 ? (
        // Passamos a lista filtrada para a tabela
        <EpisodeTable
          episodes={filteredEpisodes}
          setEpisodes={function (episodes: Episode[]): void {
            throw new Error("Function not implemented.");
          }}
        />
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
