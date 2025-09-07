"use client";
import { useState, useMemo } from "react";
import { EpisodeStats } from "./episode-stats";
import { EpisodeTable } from "./episode-table";
import { EpisodeFilters } from "./episode-filters";
import { Card, CardContent } from "@/src/components/ui/card";
import { ListMusic } from "lucide-react";
import { Button } from "@/src/components/ui/button";

export interface Episode {
  id: string;
  title: string;
  status: "published" | "draft" | "scheduled" | "archived";
  category: string;
  tags: string[];
  publicationDate: string;
  duration: string;
}

const mockEpisodes: Episode[] = [
  {
    id: "1",
    title: "Introdução ao React 19",
    status: "published",
    category: "Tecnologia",
    tags: ["react", "webdev"],
    publicationDate: "2024-03-10",
    duration: "28:45",
  },
  {
    id: "2",
    title: "Entendendo o Supabase",
    status: "published",
    category: "Tecnologia",
    tags: ["supabase", "database"],
    publicationDate: "2024-03-08",
    duration: "35:20",
  },
  {
    id: "3",
    title: "O Futuro da IA",
    status: "scheduled",
    category: "Tecnologia",
    tags: ["ia", "futurismo"],
    publicationDate: "2024-03-15",
    duration: "42:10",
  },
  {
    id: "4",
    title: "Princípios do Design UI/UX",
    status: "draft",
    category: "Design",
    tags: ["ui", "ux"],
    publicationDate: "2024-03-12",
    duration: "55:30",
  },
  {
    id: "5",
    title: "Como Criar um Podcast de Sucesso",
    status: "archived",
    category: "Marketing",
    tags: ["podcast", "criação"],
    publicationDate: "2023-12-20",
    duration: "62:00",
  },
];

export function EpisodeManagement() {
  const [episodes, setEpisodes] = useState<Episode[]>(mockEpisodes);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);

  const filteredEpisodes = useMemo(() => {
    return episodes.filter((episode) => {
      const matchesSearch =
        episode.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        episode.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        );
      const matchesStatus =
        statusFilter.length === 0 || statusFilter.includes(episode.status);
      const matchesCategory =
        categoryFilter.length === 0 ||
        categoryFilter.includes(episode.category);
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [episodes, searchTerm, statusFilter, categoryFilter]);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter([]);
    setCategoryFilter([]);
  };

  // CORREÇÃO APLICADA AQUI
  const hasActiveFilters =
    Boolean(searchTerm) || statusFilter.length > 0 || categoryFilter.length > 0;

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

      <EpisodeStats episodes={episodes} />

      <EpisodeFilters
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
        <EpisodeTable episodes={filteredEpisodes} setEpisodes={setEpisodes} />
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
