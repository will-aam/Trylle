"use client";

import { Wand2 } from "lucide-react";
import { Episode } from "@/src/lib/types";
import { EpisodeCard } from "../episode-card"; // Usando o EpisodeCard oficial do projeto

// Dados estáticos CORRIGIDOS para corresponder à interface Episode de src/lib/types.ts
const recommendedEpisodes: Episode[] = [
  {
    id: "rec-1",
    title: "A Ascensão da IA Generativa",
    description: "Análise sobre o impacto da IA no futuro.",
    audio_url: "",
    file_name: "",
    status: "published",
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    duration_in_seconds: 1680, // CORRIGIDO: 28min * 60s
    view_count: 0,
    tags: [],
    program_id: "prog-1",
    episode_number: 15,
    programs: {
      id: "prog-1",
      title: "Tecnologia Descomplicada",
      description: "",
      category_id: "cat-tech",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      category: {
        id: "cat-tech",
        name: "Tecnologia",
        created_at: new Date().toISOString(),
      },
    },
    category_id: "cat-tech",
    subcategory_id: null,
  },
  {
    id: "rec-2",
    title: "O Futuro do Trabalho Remoto",
    description: "As tendências do trabalho pós-pandemia.",
    audio_url: "",
    file_name: "",
    status: "published",
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    duration_in_seconds: 2100, // CORRIGIDO: 35min * 60s
    view_count: 0,
    tags: [],
    program_id: "prog-2",
    episode_number: 9,
    programs: {
      id: "prog-2",
      title: "Negócios em Foco",
      description: "",
      category_id: "cat-business",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      category: {
        id: "cat-business",
        name: "Negócios",
        created_at: new Date().toISOString(),
      },
    },
    category_id: "cat-business",
    subcategory_id: null,
  },
  // Adicionei mais dois exemplos para completar a grade visual
  {
    id: "rec-3",
    title: "Lições de Liderança de Neemias",
    description: "Uma perspectiva bíblica sobre liderança.",
    audio_url: "",
    file_name: "",
    status: "published",
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    duration_in_seconds: 1320, // CORRIGIDO: 22min * 60s
    view_count: 0,
    tags: [],
    program_id: "prog-3",
    episode_number: 11,
    programs: {
      id: "prog-3",
      title: "Sabedoria Bíblica",
      description: "",
      category_id: "cat-bible",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      category: {
        id: "cat-bible",
        name: "Estudos Bíblicos",
        created_at: new Date().toISOString(),
      },
    },
    category_id: "cat-bible",
    subcategory_id: null,
  },
];

const userMainInterest = "Tecnologia";

export function RecommendedForYouCarousel() {
  return (
    <section className="container p-0">
      <div className="mb-4 px-1 sm:px-0">
        <div className="flex items-center gap-3">
          <Wand2 className="h-6 w-6 text-yellow-500" />
          <div>
            <h2 className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-xl font-bold text-transparent md:text-2xl">
              Porque você curte {userMainInterest}
            </h2>
            <p className="text-xs font-medium text-muted-foreground">
              Episódios selecionados com base nos seus interesses
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        {recommendedEpisodes.map((episode) => (
          <EpisodeCard key={episode.id} episode={episode} />
        ))}
      </div>
    </section>
  );
}
