import { EpisodeCard } from "./episode-card";
import { Episode } from "@/src/lib/types";

const mockEpisodes: Episode[] = Array(3)
  .fill(0)
  .map((_, i) => ({
    id: `${i + 1}`,
    title: `Episódio em Destaque ${i + 1}`,
    imageUrl: `/background.jpg?height=200&width=300&text=Episódio+${i + 1}`,
    categories: { name: "Tecnologia" },
    description: `Descrição do episódio em destaque ${i + 1}.`,
    audio_url: "",
    file_name: "",
    category_id: null,
    subcategory_id: null,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status: "published",
    tags: [],
  }));

export function FeaturedEpisodes() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {mockEpisodes.map((episode, index) => (
        <EpisodeCard key={`${episode.id}-${index}`} episode={episode} />
      ))}
    </div>
  );
}
