"use client";

import { useState } from "react";
import Image from "next/image";

export function HeroSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  const podcasts = [
    {
      id: 1,
      title: "Echoes of Midnight",
      artist: "Jon Hickman",
      image:
        "https://img.freepik.com/vetores-premium/familia-observando-as-estrelas-com-telescopio-ilustracao-em-cores-planas_151150-4952.jpg",
    },
    {
      id: 2,
      title: "Night Vibes",
      artist: "Sarah Johnson",
      image:
        "https://img.freepik.com/vetores-premium/homem-negocios-luta-um-dragao_24381-851.jpg",
    },
    {
      id: 3,
      title: "Urban Rhythms",
      artist: "DJ Martinez",
      image:
        "https://img.freepik.com/vetores-gratis/ilustracao-de-metaverso-de-design-plano-desenhado-a-mao_23-2149243273.jpg?semt=ais_hybrid&w=740",
    },
    {
      id: 4,
      title: "Acoustic Sessions",
      artist: "Emma Wilson",
      image:
        "https://st.depositphotos.com/1173077/52308/v/450/depositphotos_523081264-stock-illustration-trekkers-backpack-trekking-mountain-beautiful.jpg",
    },
    {
      id: 5,
      title: "Electronic Dreams",
      artist: "Alex Chen",
      image:
        "https://img.freepik.com/vetores-premium/empresario-como-um-cavaleiro-do-dragao_24381-549.jpg?semt=ais_hybrid&w=740&q=80",
    },
  ];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? podcasts.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === podcasts.length - 1 ? 0 : prev + 1));
  };

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
        {podcasts.map((podcast, index) => {
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
            (activeIndex === 0 ? podcasts.length - 1 : activeIndex - 1)
          ) {
            translateX = "calc(-100% - 1rem)";
            translateY = 0;
            scale = 0.95;
            zIndex = 5;
          } else if (
            index ===
            (activeIndex === podcasts.length - 1 ? 0 : activeIndex + 1)
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
            <div
              key={podcast.id}
              className="absolute transition-all duration-500 ease-out"
              style={{
                transform: `translateX(${translateX}) translateY(${translateY}px) scale(${scale})`,
                opacity,
                zIndex,
              }}
            >
              <div
                className={`relative w-96 h-48 rounded-xl overflow-hidden ${
                  isActive ? "shadow-2xl" : "shadow-xl"
                }`}
              >
                <Image
                  src={podcast.image}
                  alt={podcast.title}
                  fill
                  className="object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

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
