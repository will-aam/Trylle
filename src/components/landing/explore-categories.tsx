"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { ChevronDown } from "lucide-react";

interface CategoryEpisode {
  id: number;
  category: string;
  title: string;
  description: string;
  tags: string[];
}

const categoryEpisodes: CategoryEpisode[] = [
  {
    id: 1,
    category: "Saúde",
    title: "Os Segredos da Longevidade",
    description:
      "Descubra os hábitos e práticas que podem aumentar sua expectativa de vida e melhorar sua qualidade de vida.",
    tags: ["longevidade", "hábitos", "saúde", "bem-estar", "exercícios"],
  },
  {
    id: 2,
    category: "Tecnologia",
    title: "Inteligência Artificial no Futuro",
    description:
      "Como a IA está transformando o mundo e o que podemos esperar para os próximos anos.",
    tags: ["IA", "futuro", "inovação", "tecnologia"],
  },
  {
    id: 3,
    category: "Finanças",
    title: "Investindo com Inteligência",
    description:
      "Estratégias práticas para construir patrimônio e alcançar a independência financeira.",
    tags: [
      "investimentos",
      "patrimônio",
      "finanças",
      "independência",
      "estratégias",
    ],
  },
  {
    id: 4,
    category: "Psicologia",
    title: "A Mente e as Emoções",
    description:
      "Entenda como funciona nossa mente e aprenda a lidar melhor com suas emoções.",
    tags: ["mente", "emoções", "psicologia", "autoconhecimento"],
  },
  {
    id: 5,
    category: "Carreira",
    title: "Liderança no Século XXI",
    description:
      "As competências essenciais para ser um líder eficaz na era digital.",
    tags: ["liderança", "competências", "carreira", "digital", "gestão"],
  },
  {
    id: 6,
    category: "Educação",
    title: "Aprendizado Contínuo",
    description:
      "Como manter-se sempre aprendendo e se adaptando às mudanças do mundo moderno.",
    tags: ["aprendizado", "educação", "adaptação", "crescimento"],
  },
];

export function ExploreCategories() {
  const [showMore, setShowMore] = useState(false);
  const [visibleCount, setVisibleCount] = useState(2);

  const handleShowMore = () => {
    if (showMore) {
      setVisibleCount(2);
      setShowMore(false);
    } else {
      setVisibleCount((prev) => Math.min(prev + 2, categoryEpisodes.length));
      if (visibleCount + 2 >= categoryEpisodes.length) {
        setShowMore(true);
      }
    }
  };

  const renderTags = (tags: string[]) => {
    const visibleTags = tags.slice(0, 3);
    const remainingCount = tags.length - 3;

    return (
      <div className="flex flex-wrap gap-2">
        {visibleTags.map((tag, index) => (
          <Badge key={index} variant="outline" className="text-xs">
            {tag}
          </Badge>
        ))}
        {remainingCount > 0 && (
          <Badge variant="outline" className="text-xs">
            +{remainingCount}
          </Badge>
        )}
      </div>
    );
  };

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Explore por Categoria
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Encontre episódios organizados por temas que mais interessam você.
            Conteúdo curado para cada área do conhecimento.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {categoryEpisodes.slice(0, visibleCount).map((episode) => (
            <Card
              key={episode.id}
              className="h-full hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <Badge className="shrink-0">{episode.category}</Badge>
                </div>
                <CardTitle className="text-xl leading-tight">
                  {episode.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  {episode.description}
                </p>
                {renderTags(episode.tags)}
              </CardContent>
            </Card>
          ))}
        </div>

        {categoryEpisodes.length > 2 && (
          <div className="text-center mt-12">
            <Button
              variant="outline"
              size="lg"
              onClick={handleShowMore}
              className="gap-2 bg-transparent"
            >
              {showMore ? "Mostrar Menos" : "Mostrar Mais"}
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  showMore ? "rotate-180" : ""
                }`}
              />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
