"use client";

import { Button } from "@/src/components/ui/button";
import { Play, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { useState, useEffect, useRef } from "react";

const upcomingEpisodes = [
  {
    id: 1,
    title: "Psicologia das Vendas B2B",
    category: "Negócios",
    episodeNumber: 8,
    duration: "18 min",
    color: "bg-gradient-to-r from-blue-500 to-blue-600",
  },
  {
    id: 2,
    title: "IA Generativa no Trabalho",
    category: "Tecnologia",
    episodeNumber: 12,
    duration: "22 min",
    color: "bg-gradient-to-r from-purple-500 to-purple-600",
  },
  {
    id: 3,
    title: "Dualismo gnóstico",
    category: "Filosofia",
    episodeNumber: 5,
    duration: "20 min",
    color: "bg-gradient-to-r from-orange-500 to-orange-600",
  },
  {
    id: 4,
    title: "Crimes na internet e o direito probatório",
    category: "Direito",
    episodeNumber: 9,
    duration: "36 min",
    color: "bg-gradient-to-r from-green-500 to-green-600",
  },
  {
    id: 5,
    title: "Devo guardar o sábado ou o domingo?",
    category: "Teologia",
    episodeNumber: 13,
    duration: "24 min",
    color: "bg-gradient-to-r from-indigo-500 to-indigo-600",
  },
  {
    id: 6,
    title: "Marketing Digital 2025",
    category: "Marketing",
    episodeNumber: 7,
    duration: "19 min",
    color: "bg-gradient-to-r from-pink-500 to-pink-600",
  },
];

export function UpcomingEpisodesCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [itemsPerView, setItemsPerView] = useState(3);

  useEffect(() => {
    const getItemsPerView = () => {
      if (window.innerWidth < 640) return 1; // mobile
      if (window.innerWidth < 1024) return 2; // tablet
      return 3; // desktop
    };

    const handleResize = () => {
      setItemsPerView(getItemsPerView());
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = Math.max(0, upcomingEpisodes.length - itemsPerView);

  useEffect(() => {
    if (!isAutoScrolling) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= maxIndex) {
          return 0;
        }
        return prev + 1;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoScrolling, maxIndex]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const handleMouseEnter = () => setIsAutoScrolling(false);
  const handleMouseLeave = () => setIsAutoScrolling(true);

  return (
    <section className="py-8 md:py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-1 md:mb-2">
              Próximos Episódios
            </h2>
            <p className="text-sm md:text-base text-muted-foreground">
              Novos conteúdos toda semana
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={prevSlide}
              className="h-8 w-8 p-0 rounded-full hover:bg-muted transition-all duration-200"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={nextSlide}
              className="h-8 w-8 p-0 rounded-full hover:bg-muted transition-all duration-200"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="absolute left-0 top-0 bottom-0 w-4 md:w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-4 md:w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

          <div className="overflow-hidden px-1 md:px-2">
            <div
              ref={scrollContainerRef}
              className="flex gap-2 md:gap-4 transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${
                  currentIndex * (100 / itemsPerView)
                }%)`,
              }}
            >
              {upcomingEpisodes.map((episode) => (
                <div
                  key={episode.id}
                  className={`flex-none group cursor-pointer ${
                    itemsPerView === 1
                      ? "w-full"
                      : itemsPerView === 2
                      ? "w-1/2"
                      : "w-1/3"
                  }`}
                >
                  <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-lg md:rounded-xl bg-card hover:bg-muted/50 transition-all duration-300 border border-border/50 hover:border-border hover:shadow-md min-h-[80px] md:min-h-[90px]">
                    <div
                      className={`flex-none w-12 h-12 md:w-14 md:h-14 rounded-lg md:rounded-xl ${episode.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                    >
                      <Play className="w-5 h-5 md:w-6 md:h-6 text-white fill-white" />
                    </div>

                    <div className="flex-1 min-w-0 overflow-hidden">
                      <h3 className="font-semibold text-xs md:text-sm lg:text-base leading-tight group-hover:text-primary transition-colors duration-200 truncate">
                        Ep. {episode.episodeNumber} - {episode.title}
                      </h3>
                      <div className="flex items-center gap-1 md:gap-2 mt-1 md:mt-2">
                        <span className="text-xs text-muted-foreground font-medium truncate max-w-[80px] md:max-w-none">
                          {episode.category}
                        </span>
                        <span className="text-xs text-muted-foreground hidden sm:inline">
                          •
                        </span>
                        <div className="flex items-center gap-1 sm:flex">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {episode.duration}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-2 mt-4 md:mt-6 sm:hidden">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "bg-primary w-6"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
