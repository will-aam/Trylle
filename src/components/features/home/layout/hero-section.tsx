// src/components/features/home/layout/hero-section.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
// 1. CORREÇÃO: Importando o tipo correto que você já tem
import { ProgramWithRelations } from "@/src/lib/types";

interface HeroSectionProps {
  // 2. CORREÇÃO: Usando o tipo correto na prop
  programs: ProgramWithRelations[];
}

// 3. Recebemos a prop 'programs'
export function HeroSection({ programs }: HeroSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? programs.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === programs.length - 1 ? 0 : prev + 1));
  };

  if (!programs || programs.length === 0) {
    // Um placeholder simples
    return (
      <div className="relative w-full h-48 overflow-hidden rounded-2xl bg-muted" />
    );
  }

  return (
    <div className="relative w-full h-48 overflow-hidden rounded-2xl">
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-black via-black/70 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-black via-black/70 to-transparent z-10 pointer-events-none" />

      <div
        onClick={handlePrev}
        className="absolute left-0 top-0 w-1/4 h-full z-20 cursor-pointer"
      />
      <div
        onClick={handleNext}
        className="absolute right-0 top-0 w-1/4 h-full z-20 cursor-pointer"
      />

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
              href={`/program/${program.id}`} // Rota de destino
              className="absolute transition-all duration-500 ease-out"
              style={{
                transform: `translateX(${translateX}) translateY(${translateY}px) scale(${scale})`,
                opacity,
                zIndex,
              }}
              aria-label={`Acessar programa ${program.title}`}
            >
              <div
                className={`relative w-96 h-48 rounded-xl overflow-hidden ${
                  isActive ? "shadow-2xl" : "shadow-xl"
                }`}
              >
                <Image
                  src={program.image_url || "/placeholder-image.jpg"} // Imagem real
                  alt={program.title}
                  fill
                  className="object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

                <div className="absolute inset-0 flex items-center p-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1 drop-shadow-lg">
                      {program.title} {/* Título real */}
                    </h3>
                    <p className="text-white/90 text-sm drop-shadow">
                      {/* 4. CORREÇÃO: Acessando o nome da categoria com segurança */}
                      {program.categories?.name || "Sem categoria"}
                    </p>
                  </div>
                </div>

                {!isActive && (
                  <div className="absolute inset-0 bg-black/40 z-20" />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
