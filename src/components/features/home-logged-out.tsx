import { Hero } from "@/src/components/features/hero";
import { FeaturedEpisodes } from "@/src/components/features/featured-episodes";
import { RecentEpisodes } from "@/src/components/features/recent-episodes";
import { CategoryCarousel } from "./category-carousel";
import { PricingSection } from "./pricing-section";
import { FollowUsSection } from "./follow-us-section";

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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Episódios em Destaque
          </h2>
          <a
            href="/login"
            className="text-sm font-medium text-primary hover:underline"
          >
            Ver todos
          </a>
        </div>
        <FeaturedEpisodes episodes={mockEpisodes} />
      </section>
      <section>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Categorias</h2>
        {/* Substituímos a grade antiga pelo novo carrossel */}
        <CategoryCarousel />
      </section>
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Episódios Recentes
          </h2>
          <a
            href="/login"
            className="text-sm font-medium text-primary hover:underline"
          >
            Ver todos
          </a>
        </div>
        <RecentEpisodes episodes={mockEpisodes} />
      </section>
      <PricingSection />
      <FollowUsSection />
    </div>
  );
}
