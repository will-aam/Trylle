import { EpisodeCard } from "./episode-card";
import { Episode } from "@/src/lib/types";

const mockRecentEpisodes: Episode[] = [
  {
    id: "4",
    title: "Blockchain e Criptomoedas Explicadas",
    // VERIFIQUE SE ESTA LINHA EXISTE
    description: "Entenda a tecnologia por trás das moedas digitais",
    imageUrl: "/Whisk_dbc581f98f.jpg?height=200&width=300&text=Episódio+4",
    categories: { name: "Tecnologia" },
    audio_url: "",
    file_name: "",
    category_id: null,
    subcategory_id: null,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status: "published",
    tags: [],
  },
  // (faça o mesmo para os outros objetos no array)
  // ...
];

export function RecentEpisodes() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {mockRecentEpisodes.map((episode) => (
        <EpisodeCard key={episode.id} episode={episode} />
      ))}
    </div>
  );
}
