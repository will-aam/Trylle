// src/components/features/featured-episodes.tsx
import { EpisodeCard } from "./episode-card";
import { Episode } from "@/src/lib/types";

// CORREÇÃO: Adicionados os campos obrigatórios `program_id` e `episode_number`.
// O campo `imageUrl` foi removido pois não pertence ao tipo Episode.
const mockEpisodes: Episode[] = Array(3)
  .fill(0)
  .map((_, i) => ({
    id: `${i + 1}`,
    title: `Episódio de Destaque ${i + 1}`,
    description: `Esta é a descrição para o episódio de destaque número ${
      i + 1
    }.`,
    audio_url: "", // URL de áudio de exemplo
    file_name: "",
    category_id: null,
    subcategory_id: null,
    status: "published",
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    duration_in_seconds: 1800,
    view_count: 1234,
    tags: [],
    program_id: null, // Campo adicionado
    episode_number: null, // Campo adicionado
    categories: { name: "Tecnologia" },
    programs: {
      id: "1",
      title: "Programa Exemplo",
      description: "Descrição do programa",
      category_id: "1",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      cover_image_path: "https://rounder.pics/assets/img/ui/square-image.webp",
    },
  }));

export function FeaturedEpisodes() {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">
          Episódios em Destaque
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {mockEpisodes.map((episode) => (
            <EpisodeCard key={episode.id} episode={episode} />
          ))}
        </div>
      </div>
    </section>
  );
}
