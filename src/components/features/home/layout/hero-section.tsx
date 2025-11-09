// src/components/features/home/layout/hero-section.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ProgramWithRelations } from "@/src/lib/types";
import { Button } from "@/src/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/src/lib/utils";

// 1. Constantes para facilitar a manutenção
const ACTIVE_SCALE = 1.03;
const INACTIVE_SCALE = 0.95;
const SPACING = 1; // em rem
const CARD_WIDTH_MOBILE = "w-80";
const CARD_WIDTH_DESKTOP = "md:w-96";

interface HeroSectionProps {
  programs: ProgramWithRelations[];
}

export function HeroSection({ programs }: HeroSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? programs.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === programs.length - 1 ? 0 : prev + 1));
  };

  // Navegação por Teclado com useCallback
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        handlePrev();
      } else if (event.key === "ArrowRight") {
        handleNext();
      }
    },
    [handlePrev, handleNext]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  // Refatoração da Lógica com useMemo usando constantes
  const itemStyles = useMemo(() => {
    return programs.map((_, index) => {
      const isActive = index === activeIndex;

      let translateX: string = "0px";
      let translateY = 0;
      let scale = 1;
      let opacity = 1;
      let zIndex = 1;

      if (isActive) {
        translateX = "0px";
        translateY = 0;
        scale = ACTIVE_SCALE;
        zIndex = 10;
      } else if (
        index === (activeIndex === 0 ? programs.length - 1 : activeIndex - 1)
      ) {
        translateX = `calc(-100% - ${SPACING}rem)`;
        translateY = 0;
        scale = INACTIVE_SCALE;
        zIndex = 5;
      } else if (
        index === (activeIndex === programs.length - 1 ? 0 : activeIndex + 1)
      ) {
        translateX = `calc(100% + ${SPACING}rem)`;
        translateY = 0;
        scale = INACTIVE_SCALE;
        zIndex = 5;
      } else {
        opacity = 0;
        zIndex = 1;
      }

      return {
        transform: `translateX(${translateX}) translateY(${translateY}px) scale(${scale})`,
        opacity,
        zIndex,
      };
    });
  }, [activeIndex, programs.length]);

  if (!programs || programs.length === 0) {
    return (
      <div className="relative w-full h-48 md:h-52 overflow-hidden rounded-2xl bg-muted" />
    );
  }

  const activeProgram = programs[activeIndex];

  return (
    <>
      {/* 2. Melhorias de Acessibilidade */}
      <div
        className="group relative w-full h-48 md:h-52 overflow-hidden rounded-2xl focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        role="group"
        aria-roledescription="Carrossel de programas"
        tabIndex={0}
      >
        {/* Gradientes para dar contraste ao texto (Desktop) */}
        <div className="hidden md:block absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-black via-black/70 to-transparent z-10 pointer-events-none" />
        <div className="hidden md:block absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-black via-black/70 to-transparent z-10 pointer-events-none" />

        {/* Áreas de clique para navegação (Apenas Desktop) */}
        <div
          onClick={handlePrev}
          className="hidden md:block absolute left-0 top-0 w-1/4 h-full z-20 cursor-pointer"
        />
        <div
          onClick={handleNext}
          className="hidden md:block absolute right-0 top-0 w-1/4 h-full z-20 cursor-pointer"
        />

        {/* Container do Carrossel */}
        <div className="relative w-full h-full flex items-center justify-center">
          {programs.map((program, index) => {
            const isActive = index === activeIndex;
            const style = itemStyles[index];

            return (
              <Link
                key={program.id}
                href={`/program/${program.id}`}
                className={cn(
                  "absolute transition-all duration-500 ease-out focus:outline-none",
                  isActive &&
                    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                )}
                style={style}
                aria-label={`Acessar programa ${program.title}, ${
                  isActive ? "item atual do carrossel" : ""
                }`}
                tabIndex={isActive ? 0 : -1} // Gerenciamento de tabIndex
              >
                <div
                  className={cn(
                    `relative ${CARD_WIDTH_MOBILE} ${CARD_WIDTH_DESKTOP} h-48 rounded-xl overflow-hidden shadow-xl transition-transform duration-300`,
                    isActive ? "shadow-2xl hover:scale-105" : ""
                  )}
                >
                  <Image
                    src={program.image_url || "/placeholder-image.jpg"}
                    alt={program.title}
                    fill
                    className="object-cover rounded-xl"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 384px"
                  />

                  {/* Gradiente e texto (Aparece em todas as telas) */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute inset-0 flex items-end p-4 md:p-6">
                    <div className="w-full">
                      <h3 className="text-lg md:text-xl font-bold text-white mb-1 drop-shadow-lg truncate">
                        {program.title}
                      </h3>
                      <p className="text-white/90 text-xs md:text-sm drop-shadow truncate">
                        {program.categories?.name || "Sem categoria"}
                      </p>
                    </div>
                  </div>

                  {/* Escurecer os itens não ativos */}
                  {!isActive && (
                    <div className="absolute inset-0 bg-black/40 z-20" />
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Botões de navegação (Desktop - aparecem no hover) */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrev}
          className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-30 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          aria-label="Programa anterior"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleNext}
          className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-30 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          aria-label="Próximo programa"
        >
          <ChevronRight className="w-6 h-6" />
        </Button>

        {/* Botão de Avançar (Apenas Mobile) */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNext}
          className="md:hidden absolute right-2 top-1/2 -translate-y-1/2 z-30 bg-black/50 text-white rounded-full hover:bg-black/70"
          aria-label="Próximo programa"
        >
          <ChevronRight className="w-6 h-6" />
        </Button>

        {/* 3. Anúncio para leitores de tela */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {activeProgram && `Programa em destaque: ${activeProgram.title}`}
        </div>
      </div>

      {/* Link "Ver Tudo" (Apenas Mobile) */}
      <div className="md:hidden mt-4 text-center">
        <Link
          href="/library-in"
          className="text-sm font-medium text-primary hover:underline"
        >
          Ver tudo
        </Link>
      </div>
    </>
  );
}
