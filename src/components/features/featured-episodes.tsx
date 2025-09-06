import { EpisodeCard } from "./episode-card";
import { Episode } from "@/src/lib/types";

// Usando dados estáticos para o front-end
const mockEpisodes: Episode[] = Array(3)
  .fill(0)
  .map((_, i) => ({
    id: `${i + 1}`,
    title: `Episódio em Destaque ${i + 1}`,
    imageUrl: `/background.jpg?height=200&width=300&text=Episódio+${i + 1}`,
    categories: { name: "Tecnologia" },
    // Adicionando o resto dos campos necessários para o tipo Episode
    description: "Descrição do episódio.",
    audio_url: "",
    file_name: "",
    category_id: null,
    subcategory_id: null,
    tags: null,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

export function FeaturedEpisodes() {
  return (
    // Um grid que se adapta, mostrando 1 coluna no celular e 2 ou 3 em telas maiores
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {mockEpisodes.map((episode, index) => (
        <EpisodeCard key={`${episode.id}-${index}`} episode={episode} />
      ))}
    </div>
  );
}
