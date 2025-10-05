// src/components/features/featured-episodes.tsx
import { Episode } from "@/src/lib/types";
import { EpisodeCard } from "./episode-card";

// CORREÇÃO: Adicionado o campo obrigatório `episode_documents` à simulação.
const mockEpisodes: Episode[] = Array(3)
  .fill(0)
  .map((_, i) => ({
    id: `${i + 1}`,
    title: `Episódio em Destaque ${i + 1}`,
    description: "Esta é uma breve descrição do episódio em destaque.",
    audio_url: "/placeholder-audio.mp3",
    file_name: `Episódio ${i + 1}.mp3`,
    category_id: "1",
    subcategory_id: "1",
    status: "published",
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    duration_in_seconds: 1800 + i * 60,
    view_count: 1234 + i * 100,
    tags: [],
    program_id: "1",
    episode_number: i + 1,
    episode_documents: [], // <-- LINHA ADICIONADA
  }));

export function FeaturedEpisodes() {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8">Episódios em Destaque</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockEpisodes.map((episode) => (
            <EpisodeCard key={episode.id} episode={episode} />
          ))}
        </div>
      </div>
    </section>
  );
}
