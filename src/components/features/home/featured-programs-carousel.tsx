"use client";

import { ChevronLeft, ChevronRight, Clock, List, Play } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import type React from "react";
import { Button } from "@/src/components/ui/button";
import { Separator } from "@/src/components/ui/separator";
import { cn } from "@/src/lib/utils";

// Tipagem para um programa em destaque
type FeaturedProgram = {
  id: number;
  title: string;
  description: string;
  author: string;
  episodeCount: number;
  totalDuration: string;
  color: string;
};

// Dados estáticos dos programas em destaque
const featuredPrograms: FeaturedProgram[] = [
  {
    id: 1,
    title: "Série sobre Gênesis",
    description:
      "Uma jornada completa pelo livro de Gênesis, explorando a criação, os patriarcas e os fundamentos da fé.",
    author: "Trylle",
    episodeCount: 12,
    totalDuration: "6h 15min",
    color: "bg-gradient-to-br from-amber-500 via-orange-600 to-red-600",
  },
  {
    id: 2,
    title: "Fundamentos da Inovação",
    description:
      "Desvende os princípios e mentalidades que impulsionam a inovação em negócios e tecnologia.",
    author: "Trylle",
    episodeCount: 8,
    totalDuration: "2h 45min",
    color: "bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600",
  },
  {
    id: 3,
    title: "Introdução à Filosofia",
    description:
      "Conheça os grandes pensadores e as questões fundamentais que moldaram o pensamento ocidental.",
    author: "Trylle",
    episodeCount: 10,
    totalDuration: "4h 30min",
    color: "bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600",
  },
  {
    id: 4,
    title: "Psicologia do Desenvolvimento",
    description:
      "Entenda as fases do desenvolvimento humano e os fatores que influenciam quem nos tornamos.",
    author: "Trylle",
    episodeCount: 15,
    totalDuration: "7h 20min",
    color: "bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600",
  },
];

function ProgramCard({
  program,
  onClick,
}: {
  program: FeaturedProgram;
  onClick: () => void;
}) {
  return (
    <div
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl bg-white/10 transition-all duration-500 hover:scale-[1.02] dark:bg-white/5"
      onClick={onClick}
    >
      {/* Capa do Programa */}
      <div
        className={cn(
          "relative h-48 w-full overflow-hidden shadow-xl",
          program.color
        )}
      >
        <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-all duration-500 group-hover:scale-110">
            <Play className="h-8 w-8 fill-white text-white drop-shadow-lg" />
          </div>
        </div>
      </div>

      {/* Conteúdo do Card */}
      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <h3 className="truncate text-lg font-bold leading-tight text-foreground sm:text-xl">
            {program.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-xs font-medium text-muted-foreground sm:text-sm">
            {program.description}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-3 text-xs text-foreground/80">
          <span className="font-medium">{program.author}</span>
          <Separator orientation="vertical" className="h-3 bg-gray-700" />
          <div className="flex items-center gap-1.5">
            <List className="h-3 w-3" />
            <span className="font-medium">{program.episodeCount} eps</span>
          </div>
          <Separator orientation="vertical" className="h-3 bg-gray-700" />
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            <span className="font-medium">{program.totalDuration}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FeaturedProgramsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(2);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [mobileIndex, setMobileIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    const getItemsPerView = () => {
      if (window.innerWidth < 768) return 1; // mobile
      if (window.innerWidth < 1280) return 2; // tablet e desktop pequeno
      return 2; // desktop grande
    };
    const handleResize = () => setItemsPerView(getItemsPerView());
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = Math.max(0, featuredPrograms.length - itemsPerView);

  // Auto-avanço para desktop
  useEffect(() => {
    if (isPaused || isDragging) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 5000); // Intervalo um pouco mais longo para cards maiores
    return () => clearInterval(interval);
  }, [isPaused, isDragging, maxIndex]);

  // Auto-avanço para mobile
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setMobileIndex((prev) =>
        prev === featuredPrograms.length - 1 ? 0 : prev + 1
      );
    }, 5000);
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

  const handleCardClick = (programId: number) => {
    if (isDragging) return;
    console.log(`Clicou no programa ${programId}`);
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

  // Touch events para mobile
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
    setMobileIndex((prev) =>
      prev === featuredPrograms.length - 1 ? 0 : prev + 1
    );
  };
  const prevMobileCard = () => {
    setMobileIndex((prev) =>
      prev === 0 ? featuredPrograms.length - 1 : prev - 1
    );
  };

  return (
    <section className="relative overflow-hidden py-8">
      <div className="container">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <div>
              <h2 className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-xl font-bold text-transparent md:text-3xl">
                Programas em Destaque
              </h2>
              <p className="mt-1 text-xs font-medium text-muted-foreground md:text-sm">
                Conheça nossas séries e mergulhe nos assuntos
              </p>
            </div>
          </div>
          {/* Botões de navegação do Desktop - visíveis apenas em telas maiores */}
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

        {/* --- Layout do Carrossel (Desktop) --- */}
        {/* --- Layout do Carrossel (Desktop) --- */}
        <div className="hidden md:block">
          <div
            className="cursor-grab overflow-hidden"
            onMouseDown={handleMouseDown}
            onMouseUp={handleDragEnd}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={(e) => {
              handleDragEnd(e); // Finaliza o arrastar, se houver
              setIsPaused(false); // Reativa o auto-play
            }}
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
              {featuredPrograms.map((program) => (
                <div
                  key={program.id}
                  className="flex-none px-3"
                  style={{ width: `${100 / itemsPerView}%` }}
                >
                  <ProgramCard
                    program={program}
                    onClick={() => handleCardClick(program.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- Layout do Slider (Mobile) --- */}
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
              {featuredPrograms.map((program) => (
                <div key={program.id} className="w-full flex-none px-1">
                  <ProgramCard
                    program={program}
                    onClick={() => handleCardClick(program.id)}
                  />
                </div>
              ))}
            </div>
          </div>
          {/* Controles de navegação e paginação do Mobile */}
          <div className="mt-3 flex items-center justify-center">
            <div className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 p-1.5 backdrop-blur-md">
              {featuredPrograms.map((_, index) => (
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
    </section>
  );
}
