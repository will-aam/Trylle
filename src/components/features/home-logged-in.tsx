import { FeaturedEpisodes } from "@/src/components/features/featured-episodes";
import { RecentEpisodes } from "@/src/components/features/recent-episodes";
import { CategoryCarousel } from "./category-carousel"; // 1. Importa o carrossel

export function HomeLoggedIn() {
  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-2xl font-bold tracking-tight mb-4">
          Tocado recentemente
        </h2>
        <RecentEpisodes />
      </section>

      {/* 2. Adiciona a nova seção de categorias aqui */}
      <section>
        <h2 className="text-2xl font-bold tracking-tight mb-4">
          Navegar por Categorias
        </h2>
        <CategoryCarousel />
      </section>

      <section>
        <h2 className="text-2xl font-bold tracking-tight mb-4">
          Feito para Você
        </h2>
        <FeaturedEpisodes />
      </section>
    </div>
  );
}
