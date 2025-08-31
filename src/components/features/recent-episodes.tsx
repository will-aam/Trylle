import { EpisodeCard } from "./episode-card";

const recentEpisodes = [
  {
    id: "4",
    title: "Blockchain e Criptomoedas Explicadas",
    description: "Entenda a tecnologia por trás das moedas digitais",
    thumbnail: "/placeholder.svg?height=200&width=300",
    duration: 2580,
    category: "Tecnologia",
    author: "Prof. Ana Costa",
    publishedAt: "2024-01-18",
    plays: 8750,
    rating: 4.6,
  },
  {
    id: "5",
    title: "Psicologia Positiva no Trabalho",
    description:
      "Como aplicar princípios de bem-estar no ambiente profissional",
    thumbnail: "/placeholder.svg?height=200&width=300",
    duration: 1950,
    category: "Saúde",
    author: "Dr. Pedro Lima",
    publishedAt: "2024-01-17",
    plays: 6420,
    rating: 4.8,
  },
  {
    id: "6",
    title: "História da Computação Quântica",
    description: "Dos primeiros conceitos aos computadores quânticos atuais",
    thumbnail: "/placeholder.svg?height=200&width=300",
    duration: 3120,
    category: "Ciência",
    author: "Dra. Laura Ferreira",
    publishedAt: "2024-01-16",
    plays: 5890,
    rating: 4.9,
  },
  {
    id: "7",
    title: "Liderança em Tempos de Mudança",
    description: "Estratégias para liderar equipes em ambientes dinâmicos",
    thumbnail: "/placeholder.svg?height=200&width=300",
    duration: 2240,
    category: "Negócios",
    author: "Roberto Alves",
    publishedAt: "2024-01-15",
    plays: 7320,
    rating: 4.7,
  },
];

export function RecentEpisodes() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {recentEpisodes.map((episode) => (
        <EpisodeCard key={episode.id} episode={episode} />
      ))}
    </div>
  );
}
