import { Hero } from "@/src/components/features/hero";
import { FeaturedEpisodes } from "@/src/components/features/featured-episodes";
import { RecentEpisodes } from "@/src/components/features/recent-episodes";
import { CategoryCarousel } from "./category-carousel";
import { PricingSection } from "./pricing-section";
import { TestimonialsSection } from "./testimonials-section";
import { Button } from "../ui/button";
import { Play, Headphones, TrendingUp } from "lucide-react";

const mockEpisodes = [
  {
    id: "1",
    title: "O Futuro da Inteligência Artificial",
    categories: { name: "Tecnologia" },
    duration: "45 min",
    description: "Explorando como a IA está transformando nosso mundo",
    plays: "12.5K",
  },
  {
    id: "2",
    title: "Mindfulness e Produtividade",
    categories: { name: "Bem-estar" },
    duration: "32 min",
    description: "Técnicas para manter o foco no mundo moderno",
    plays: "8.2K",
  },
  {
    id: "3",
    title: "Startups que Mudaram o Mundo",
    categories: { name: "Negócios" },
    duration: "38 min",
    description: "Histórias inspiradoras de empreendedorismo",
    plays: "15.1K",
  },
  {
    id: "4",
    title: "Ciência do Sono e Performance",
    categories: { name: "Saúde" },
    duration: "41 min",
    description: "Como otimizar seu descanso para melhor performance",
    plays: "9.7K",
  },
  {
    id: "5",
    title: "Criptomoedas Explicadas",
    categories: { name: "Finanças" },
    duration: "29 min",
    description: "Entenda o mundo das moedas digitais",
    plays: "11.3K",
  },
];

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
        <FeaturedEpisodes episodes={mockEpisodes} />
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
        <RecentEpisodes episodes={mockEpisodes} />
      </section>

      <TestimonialsSection />

      <PricingSection />
    </div>
  );
}
