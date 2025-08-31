import { Suspense } from "react";
import { FeaturedEpisodes } from "@/src/components/features/featured-episodes";
import { CategoryGrid } from "@/src/components/features/category-grid";
import { RecentEpisodes } from "@/src/components/features/recent-episodes";
import { Hero } from "@/src/components/features/hero";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Hero />

      <div className="container mx-auto px-4 py-8 space-y-12">
        <section>
          <h2 className="text-2xl font-bold mb-6">Episódios em Destaque</h2>
          <Suspense
            fallback={
              <div className="animate-pulse bg-muted h-48 rounded-lg" />
            }
          >
            <FeaturedEpisodes />
          </Suspense>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6">Categorias</h2>
          <CategoryGrid />
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6">Episódios Recentes</h2>
          <Suspense
            fallback={
              <div className="animate-pulse bg-muted h-64 rounded-lg" />
            }
          >
            <RecentEpisodes />
          </Suspense>
        </section>
      </div>
    </div>
  );
}
