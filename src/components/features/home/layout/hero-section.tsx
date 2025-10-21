"use client";

import { useState } from "react";
import Image from "next/image";

export function HeroSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  // Dados dos podcasts/músicas
  const podcasts = [
    {
      id: 1,
      title: "Echoes of Midnight",
      artist: "Jon Hickman",
      image: "/person-listening-music-red-background.jpg",
    },
    {
      id: 2,
      title: "Night Vibes",
      artist: "Sarah Johnson",
      image: "/person-listening-music-red-background.jpg",
    },
    {
      id: 3,
      title: "Urban Rhythms",
      artist: "DJ Martinez",
      image: "/person-listening-music-red-background.jpg",
    },
    {
      id: 4,
      title: "Acoustic Sessions",
      artist: "Emma Wilson",
      image: "/person-listening-music-red-background.jpg",
    },
    {
      id: 5,
      title: "Electronic Dreams",
      artist: "Alex Chen",
      image: "/person-listening-music-red-background.jpg",
    },
  ];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? podcasts.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === podcasts.length - 1 ? 0 : prev + 1));
  };

  return (
    // Container principal
    <div className="relative w-full h-48 overflow-hidden rounded-2xl">
      {/* Áreas de clique para navegação */}
      <div
        onClick={handlePrev}
        className="absolute left-0 top-0 w-1/4 h-full z-20 cursor-pointer"
      />
      <div
        onClick={handleNext}
        className="absolute right-0 top-0 w-1/4 h-full z-20 cursor-pointer"
      />

      {/* Container dos cards */}
      <div className="relative w-full h-full flex items-center justify-center">
        {podcasts.map((podcast, index) => {
          const isActive = index === activeIndex;

          // Posicionamento dos cards
          let translateX = 0;
          let translateY = 0;
          let scale = 1;
          let opacity = 1;
          let zIndex = 1;
          let rotate = 0;

          if (isActive) {
            // Card central
            translateX = 0;
            translateY = 0;
            scale = 1.05;
            zIndex = 10;
          } else if (
            index ===
            (activeIndex === 0 ? podcasts.length - 1 : activeIndex - 1)
          ) {
            // Card à esquerda
            translateX = -280;
            translateY = 10;
            scale = 0.95;
            zIndex = 5;
            rotate = -5;
          } else if (
            index ===
            (activeIndex === podcasts.length - 1 ? 0 : activeIndex + 1)
          ) {
            // Card à direita
            translateX = 280;
            translateY = 10;
            scale = 0.95;
            zIndex = 5;
            rotate = 5;
          } else {
            // Cards invisíveis
            opacity = 0;
            zIndex = 1;
          }

          return (
            <div
              key={podcast.id}
              className="absolute transition-all duration-500 ease-out"
              style={{
                transform: `translateX(${translateX}px) translateY(${translateY}px) scale(${scale}) rotate(${rotate}deg)`,
                opacity,
                zIndex,
              }}
            >
              <div
                className={`relative w-96 h-48 rounded-xl overflow-hidden ${
                  isActive ? "shadow-2xl" : "shadow-xl"
                }`}
              >
                {/* Imagem do podcast */}
                <Image
                  src={podcast.image}
                  alt={podcast.title}
                  fill
                  className="object-cover"
                />

                {/* Overlay gradiente */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

                {/* Conteúdo do Card */}
                <div className="absolute inset-0 flex items-center p-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1 drop-shadow-lg">
                      {podcast.title}
                    </h3>
                    <p className="text-white/90 text-sm drop-shadow">
                      {podcast.artist}
                    </p>
                  </div>
                </div>

                {/* Overlay escuro para cards laterais */}
                {!isActive && (
                  <div className="absolute inset-0 bg-black/40 z-20" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
