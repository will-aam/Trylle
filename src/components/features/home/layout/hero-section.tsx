// src/components/features/home/layout/hero-section.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ProgramWithRelations } from "@/src/lib/types";
import { Button } from "@/src/components/ui/button";
import { ChevronRight } from "lucide-react";

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

  if (!programs || programs.length === 0) {
    return (
      <div className="relative w-full h-48 md:h-52 overflow-hidden rounded-2xl bg-muted" />
    );
  }

  return (
    <>
      <div className="relative w-full h-48 md:h-52 overflow-hidden rounded-2xl">
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

            let translateX: string = "0px";
            let translateY = 0;
            let scale = 1;
            let opacity = 1;
            let zIndex = 1;

            if (isActive) {
              translateX = "0px";
              translateY = 0;
              scale = 1.03;
              zIndex = 10;
            } else if (
              index ===
              (activeIndex === 0 ? programs.length - 1 : activeIndex - 1)
            ) {
              translateX = "calc(-100% - 1rem)";
              translateY = 0;
              scale = 0.95;
              zIndex = 5;
            } else if (
              index ===
              (activeIndex === programs.length - 1 ? 0 : activeIndex + 1)
            ) {
              translateX = "calc(100% + 1rem)";
              translateY = 0;
              scale = 0.95;
              zIndex = 5;
            } else {
              opacity = 0;
              zIndex = 1;
            }

            return (
              <Link
                key={program.id}
                href={`/program/${program.id}`}
                className="absolute transition-all duration-500 ease-out"
                style={{
                  transform: `translateX(${translateX}) translateY(${translateY}px) scale(${scale})`,
                  opacity,
                  zIndex,
                }}
                aria-label={`Acessar programa ${program.title}`}
              >
                <div
                  className={`relative w-80 h-48 md:w-96 rounded-xl overflow-hidden ${
                    isActive ? "shadow-2xl" : "shadow-xl"
                  }`}
                >
                  <Image
                    src={program.image_url || "/placeholder-image.jpg"}
                    alt={program.title}
                    fill
                    className="object-cover rounded-xl" // CORREÇÃO: Volta para object-cover e com borda arredondada
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

        {/* Botão de Avançar (Apenas Mobile) */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNext}
          className="md:hidden absolute right-2 top-1/2 -translate-y-1/2 z-30 bg-black/50 text-white rounded-full hover:bg-black/70"
          aria-label="Próximo"
        >
          <ChevronRight className="w-6 h-6" />
        </Button>
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
