import { EpisodeCard } from "./episode-card";

const featuredEpisodes = [
  {
    id: "1",
    title: "O Futuro da Inteligência Artificial",
    description:
      "Uma análise profunda sobre como a IA está transformando nossa sociedade",
    thumbnail: "/placeholder.svg?height=200&width=300",
    duration: 2340, // em segundos
    category: "Tecnologia",
    author: "Dr. João Silva",
    publishedAt: "2024-01-15",
    plays: 15420,
    rating: 4.8,
  },
  {
    id: "2",
    title: "Neurociência e Aprendizado",
    description: "Como nosso cérebro processa informações e forma memórias",
    thumbnail: "/placeholder.svg?height=200&width=300",
    duration: 1890,
    category: "Ciência",
    author: "Dra. Maria Santos",
    publishedAt: "2024-01-12",
    plays: 12350,
    rating: 4.9,
  },
  {
    id: "3",
    title: "Sustentabilidade Empresarial",
    description: "Estratégias para construir negócios mais sustentáveis",
    thumbnail: "/placeholder.svg?height=200&width=300",
    duration: 2100,
    category: "Negócios",
    author: "Carlos Oliveira",
    publishedAt: "2024-01-10",
    plays: 9870,
    rating: 4.7,
  },
];

export function FeaturedEpisodes() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {featuredEpisodes.map((episode) => (
        <EpisodeCard key={episode.id} episode={episode} />
      ))}
    </div>
  );
}
