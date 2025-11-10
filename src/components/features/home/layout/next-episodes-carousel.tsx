// src/components/features/home/layout/next-episodes-carousel.tsx
"use client";

import { ChevronLeft, ChevronRight, Clock, Play } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import type React from "react";
import { Button } from "@/src/components/ui/button";
import { Separator } from "@/src/components/ui/separator";

// =======================================================
// 1. TIPO ATUALIZADO
// =======================================================
type Episode = {
  id: number;
  title: string;
  category: string;
  episodeNumber: number;
  duration: string;
  color: string;
  isNext: boolean;
  releaseDate: string;
};

// =======================================================
// 2. DADOS FALSOS ATUALIZADOS
// =======================================================
const nextEpisodes: Episode[] = [
  {
    id: 1,
    title: "Psicologia das Vendas B2B: Conectando com a Mente do Cliente",
    category: "Negócios",
    episodeNumber: 8,
    duration: "18 min",
    color: "bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600",
    isNext: true,
    releaseDate: "30/11/2028",
  },
  {
    id: 2,
    title: "IA Generativa no Trabalho",
    category: "Tecnologia",
    episodeNumber: 12,
    duration: "22 min",
    color: "bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600",
    isNext: true,
    releaseDate: "05/12/2028",
  },
  {
    id: 3,
    title: "Dualismo gnóstico e suas implicações filosóficas",
    category: "Filosofia",
    episodeNumber: 5,
    duration: "20 min",
    color: "bg-gradient-to-br from-orange-500 via-red-500 to-pink-500",
    isNext: true,
    releaseDate: "12/12/2028",
  },
  {
    id: 4,
    title: "Crimes na internet e o direito probatório",
    category: "Direito",
    episodeNumber: 9,
    duration: "36 min",
    color: "bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600",
    isNext: true,
    releaseDate: "19/12/2028",
  },
  {
    id: 5,
    title: "Devo guardar o sábado ou o domingo?",
    category: "Teologia",
    episodeNumber: 13,
    duration: "24 min",
    color: "bg-gradient-to-br from-indigo-500 via-blue-600 to-cyan-600",
    isNext: true,
    releaseDate: "25/12/2028",
  },
  {
    id: 6,
    title: "Marketing Digital para 2026: Novas Estratégias",
    category: "Marketing",
    episodeNumber: 7,
    duration: "19 min",
    color: "bg-gradient-to-br from-pink-500 via-rose-600 to-red-600",
    isNext: true,
    releaseDate: "30/12/2028",
  },
];

// =======================================================
// 3. EPISODE CARD OTIMIZADO PARA MOBILE
// =======================================================
function EpisodeCard({
  episode,
  onClick,
}: {
  episode: Episode;
  onClick: () => void;
}) {
  return (
    <div
      className="group relative flex cursor-pointer items-center gap-3 overflow-hidden rounded-2xl bg-white/10 p-3 transition-all duration-500 dark:bg-white/5"
      onClick={onClick}
    >
      {/* Ícone responsivo: menor no mobile para economizar espaço */}
      <div
        className={`relative flex-none w-14 h-14 sm:w-16 sm:h-16 rounded-xl ${episode.color} flex items-center justify-center shadow-xl transition-all duration-500 overflow-hidden`}
      >
        <div className="absolute inset-0 bg-white/20" />
        <Play className="relative z-10 h-6 w-6 sm:h-7 sm:w-7 fill-white text-white drop-shadow-lg" />
      </div>

      <div className="relative z-10 min-w-0 flex-1">
        {/* LINHA 1 (TÍTULO) */}
        <h3 className="truncate text-xs font-bold leading-tight text-foreground">
          Ep. {episode.episodeNumber} - {episode.title}
        </h3>

        {/* LINHA 2 (METADADOS) - OTIMIZADA */}
        <div className="mt-2 flex items-center gap-x-1.5 text-[10px] text-foreground/80 sm:gap-x-2 sm:text-xs">
          {/* 1. Categoria (Trunca) */}
          <span className="font-medium truncate min-w-0">
            {episode.category}
          </span>

          {/* 2. Duração (Não encolhe) */}
          <Separator
            orientation="vertical"
            className="h-3 bg-gray-700 flex-shrink-0"
          />
          <div className="flex items-center gap-1 flex-shrink-0">
            <Clock className="h-3 w-3" />
            <span className="font-medium">{episode.duration}</span>
          </div>

          {/* 3. DATA (Não encolhe) */}
          <Separator
            orientation="vertical"
            className="h-3 bg-gray-700 flex-shrink-0"
          />
          <span className="font-medium flex-shrink-0">
            {episode.releaseDate}
          </span>
        </div>
      </div>
    </div>
  );
}

// O restante do componente permanece o mesmo...
export function NextEpisodesCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView] = useState(2);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [mobileIndex, setMobileIndex] = useState(0);

  const desktopContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const maxIndex = Math.max(0, nextEpisodes.length - itemsPerView);

  useEffect(() => {
    if (isPaused || isDragging) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused, isDragging, maxIndex]);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setMobileIndex((prev) =>
        prev === nextEpisodes.length - 1 ? 0 : prev + 1
      );
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const goToIndex = (index: number) =>
    setCurrentIndex(Math.max(0, Math.min(index, maxIndex)));
  const nextSlide = () =>
    goToIndex(currentIndex >= maxIndex ? 0 : currentIndex + 1);
  const prevSlide = () =>
    goToIndex(currentIndex <= 0 ? maxIndex : currentIndex - 1);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX);
  };

  const handleCardClick = (episodeId: number) => {
    if (isDragging) return;
    console.log(`Clicou no episódio ${episodeId}`);
  };

  const handleDragEnd = (e: React.MouseEvent) => {
    if (isDragging) {
      const endX = e.pageX;
      if (e.type === "mouseup") {
        if (startX - endX > 50) nextSlide();
        else if (endX - startX > 50) prevSlide();
      }
    }
    setIsDragging(false);
    setIsPaused(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    setIsPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        nextMobileCard();
      } else {
        prevMobileCard();
      }
    }
    setIsPaused(false);
  };

  const nextMobileCard = () => {
    setMobileIndex((prev) => (prev === nextEpisodes.length - 1 ? 0 : prev + 1));
  };
  const prevMobileCard = () => {
    setMobileIndex((prev) => (prev === 0 ? nextEpisodes.length - 1 : prev - 1));
  };

  return (
    <section className="relative overflow-hidden py-8">
      <div>
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3 md:gap-4">
              <div>
                <h2 className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-xl font-bold text-transparent md:text-3xl">
                  Próximos Episódios
                </h2>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={prevSlide}
                className="h-8 w-8 rounded-lg border-white/20 bg-white/5 backdrop-blur-sm dark:border-white/10 dark:bg-white/5"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={nextSlide}
                className="h-8 w-8 rounded-lg border-white/20 bg-white/5 backdrop-blur-sm dark:border-white/10 dark:bg-white/5"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="hidden md:block">
            <div
              className="cursor-grab overflow-hidden"
              ref={desktopContainerRef}
              onMouseDown={handleMouseDown}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
              onMouseEnter={() => setIsPaused(true)}
            >
              <div
                className="-mx-3 flex transition-transform duration-700 ease-out"
                style={{
                  transform: `translateX(-${
                    currentIndex * (100 / itemsPerView)
                  }%)`,
                  pointerEvents: isDragging ? "none" : "auto",
                }}
              >
                {nextEpisodes.map((episode) => (
                  <div
                    key={episode.id}
                    className="flex-none px-3"
                    style={{ width: `${100 / itemsPerView}%` }}
                  >
                    <EpisodeCard
                      episode={episode}
                      onClick={() => handleCardClick(episode.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="md:hidden">
            <div
              ref={containerRef}
              className="overflow-hidden rounded-2xl"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${mobileIndex * 100}%)` }}
              >
                {nextEpisodes.map((episode) => (
                  <div key={episode.id} className="w-full flex-none px-1">
                    <EpisodeCard
                      episode={episode}
                      onClick={() => handleCardClick(episode.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-3 flex items-center justify-center">
              <div className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 p-1.5 backdrop-blur-md">
                {nextEpisodes.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setMobileIndex(index)}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      mobileIndex === index
                        ? "w-6 bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg shadow-blue-500/30"
                        : "w-1.5 bg-muted-foreground/40 hover:bg-muted-foreground/60"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
