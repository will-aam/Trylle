"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar, Clock } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";

interface Episode {
  id: number;
  title: string;
  category: string;
  date: string;
  time: string;
  description: string;
}

const upcomingEpisodes: Episode[] = [
  {
    id: 1,
    title: "Ep. 1 - Biotipo",
    category: "Saúde",
    date: "15 Jan",
    time: "14:00",
    description:
      "Descubra como identificar seu biotipo e otimizar sua alimentação",
  },
  {
    id: 2,
    title: "Ep. 2 - Mindfulness",
    category: "Bem-estar",
    date: "16 Jan",
    time: "16:00",
    description: "Técnicas de mindfulness para reduzir o estresse do dia a dia",
  },
  {
    id: 3,
    title: "Ep. 3 - Investimentos",
    category: "Finanças",
    date: "17 Jan",
    time: "10:00",
    description: "Primeiros passos para começar a investir com segurança",
  },
  {
    id: 4,
    title: "Ep. 4 - Produtividade",
    category: "Carreira",
    date: "18 Jan",
    time: "15:00",
    description: "Métodos comprovados para aumentar sua produtividade",
  },
  {
    id: 5,
    title: "Ep. 5 - Relacionamentos",
    category: "Psicologia",
    date: "19 Jan",
    time: "17:00",
    description: "Como construir relacionamentos mais saudáveis e duradouros",
  },
  {
    id: 6,
    title: "Ep. 6 - Tecnologia",
    category: "Inovação",
    date: "20 Jan",
    time: "11:00",
    description: "As últimas tendências em tecnologia que vão mudar o mundo",
  },
];

export function UpcomingEpisodesCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % upcomingEpisodes.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToPrevious = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? upcomingEpisodes.length - 1 : prev - 1
    );
    setIsAutoPlaying(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % upcomingEpisodes.length);
    setIsAutoPlaying(false);
  };

  const getVisibleEpisodes = () => {
    const episodes = [];
    for (let i = -2; i <= 3; i++) {
      const index =
        (currentIndex + i + upcomingEpisodes.length) % upcomingEpisodes.length;
      episodes.push({
        ...upcomingEpisodes[index],
        position: i,
      });
    }
    return episodes;
  };

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Próximos Episódios
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Não perca os próximos lançamentos. Episódios cuidadosamente
            preparados com conteúdo de qualidade.
          </p>
        </div>

        <div className="relative">
          {/* Desktop Carousel */}
          <div className="hidden md:block">
            <div className="flex items-center justify-center gap-4 overflow-hidden">
              {getVisibleEpisodes().map((episode, idx) => {
                const isCenter = episode.position === 0;
                const isVisible = Math.abs(episode.position) <= 2;

                return (
                  <Card
                    key={`${episode.id}-${idx}`}
                    className={`
                      transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] transform-gpu
                      ${
                        isCenter
                          ? "scale-110 z-10 shadow-xl border-primary/20"
                          : "scale-90 opacity-60"
                      }
                      ${isVisible ? "block" : "hidden"}
                      w-80 h-48 hover:shadow-lg
                    `}
                  >
                    <CardContent className="p-6 h-full flex flex-col justify-between">
                      <div>
                        <Badge variant="secondary" className="mb-3">
                          {episode.category}
                        </Badge>
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                          {episode.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {episode.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {episode.date}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {episode.time}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Mobile Carousel */}
          <div className="md:hidden">
            <div className="flex items-center justify-center">
              <Card className="w-full max-w-sm h-48 shadow-lg transition-all duration-500 ease-out">
                <CardContent className="p-6 h-full flex flex-col justify-between">
                  <div>
                    <Badge variant="secondary" className="mb-3">
                      {upcomingEpisodes[currentIndex].category}
                    </Badge>
                    <h3 className="font-semibold text-lg mb-2">
                      {upcomingEpisodes[currentIndex].title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {upcomingEpisodes[currentIndex].description}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {upcomingEpisodes[currentIndex].date}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {upcomingEpisodes[currentIndex].time}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Navigation Arrows */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 rounded-full bg-transparent hover:bg-background/80 transition-all duration-300"
            onClick={goToPrevious}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 rounded-full bg-transparent hover:bg-background/80 transition-all duration-300"
            onClick={goToNext}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {upcomingEpisodes.map((_, idx) => (
              <button
                key={idx}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? "bg-primary scale-125"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
                onClick={() => {
                  setCurrentIndex(idx);
                  setIsAutoPlaying(false);
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
