import { EpisodeCard } from "./episode-card";
import { Episode } from "@/src/lib/types";

const mockRecentEpisodes: Episode[] = [
  {
    id: "4",
    title: "Blockchain e Criptomoedas Explicadas",
    description: "Entenda a tecnologia por trás das moedas digitais",
    imageUrl: "/Whisk_dbc581f98f.jpg?height=200&width=300&text=Episódio+4",
    categories: { name: "Tecnologia" },
    audio_url: "",
    file_name: "",
    category_id: null,
    subcategory_id: null,
    tags: null,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "5",
    title: "Psicologia Positiva no Trabalho",
    description:
      "Como aplicar princípios de bem-estar no ambiente profissional",
    imageUrl: "/Whisk_dbc581f98f.jpg?height=200&width=300&text=Episódio+5",
    categories: { name: "Saúde" },
    audio_url: "",
    file_name: "",
    category_id: null,
    subcategory_id: null,
    tags: null,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "6",
    title: "História da Computação Quântica",
    description: "Dos primeiros conceitos aos computadores quânticos atuais",
    imageUrl: "/Whisk_dbc581f98f.jpg?height=200&width=300&text=Episódio+6",
    categories: { name: "Ciência" },
    audio_url: "",
    file_name: "",
    category_id: null,
    subcategory_id: null,
    tags: null,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "7",
    title: "Liderança em Tempos de Mudança",
    description: "Estratégias para liderar equipes em ambientes dinâmicos",
    imageUrl: "/Whisk_dbc581f98f.jpg?height=200&width=300&text=Episódio+7",
    categories: { name: "Negócios" },
    audio_url: "",
    file_name: "",
    category_id: null,
    subcategory_id: null,
    tags: null,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
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
