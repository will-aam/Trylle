import { Hero } from "@/src/components/features/hero";
import { FeaturedEpisodes } from "@/src/components/features/featured-episodes";
import { RecentEpisodes } from "@/src/components/features/recent-episodes";
import { CategoryCarousel } from "./category-carousel";
import { PricingSection } from "./pricing-section";
import { TestimonialsSection } from "./testimonials-section";
import { Button } from "../ui/button";
import { Play, Headphones, TrendingUp } from "lucide-react";

export function HomeLoggedOut() {
  return (
    <div className="space-y-16">
      <Hero />

      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-balance">
              Episódios em Destaque
            </h2>
            <p className="text-muted-foreground mt-2">
              Conteúdo selecionado especialmente para você
            </p>
          </div>
          <a href="/login">
            <Button variant="outline" className="group bg-transparent">
              <Play className="mr-2 h-4 w-4 group-hover:text-primary transition-colors" />
              Explorar
            </Button>
          </a>
        </div>
        <FeaturedEpisodes />
      </section>

      <section className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-balance mb-4">
            Explore por Categoria
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Descubra conteúdo organizado por temas que mais interessam você
          </p>
        </div>
        <CategoryCarousel />
      </section>

      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-balance">
              Episódios Recentes
            </h2>
            <p className="text-muted-foreground mt-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Mais de 50 mil ouvintes esta semana
            </p>
          </div>
          <div className="flex gap-3">
            <a href="/login">
              <Button size="sm">Ver Todos</Button>
            </a>
          </div>
        </div>
        <RecentEpisodes />
      </section>

      <TestimonialsSection />

      <PricingSection />
    </div>
  );
}
