import { Hero } from "@/src/components/features/hero";
import { FeaturedEpisodes } from "@/src/components/features/featured-episodes";
import { RecentEpisodes } from "@/src/components/features/recent-episodes";
import { CategoryCarousel } from "./category-carousel"; // Importa o novo componente

// Dados estáticos para simulação
const mockEpisodes = Array(5).fill({
  id: "1",
  title: "Título do Episódio de Exemplo",
  categories: { name: "Categoria" },
});

export function HomeLoggedOut() {
  return (
    <div className="space-y-12">
      <Hero />
      <section>
        <h2 className="text-2xl font-bold tracking-tight mb-4">
          Episódios em Destaque
        </h2>
        <FeaturedEpisodes episodes={mockEpisodes} />
      </section>
      <section>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Categorias</h2>
        {/* Substituímos a grade antiga pelo novo carrossel */}
        <CategoryCarousel />
      </section>
      <section>
        <h2 className="text-2xl font-bold tracking-tight mb-4">
          Episódios Recentes
        </h2>
        <RecentEpisodes episodes={mockEpisodes} />
      </section>
    </div>
  );
}
