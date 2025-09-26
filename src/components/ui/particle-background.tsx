// src/components/ui/particle-background.tsx

"use client";
import React, { useState, useEffect, useMemo } from "react"; // Adicionado useState e useEffect
import "./particle-background.css";

const ParticleBackground = () => {
  const particleCount = 150;

  // --- INÍCIO DA CORREÇÃO ---
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  // --- FIM DA CORREÇÃO ---

  const particles = useMemo(() => {
    if (!mounted) return { particleArray: [], styleSheet: "" }; // Não gera nada se não estiver montado

    const particleArray = [];
    let styleSheet = "";

    for (let i = 1; i <= particleCount; i++) {
      const size = Math.floor(Math.random() * 8) + 3;
      const moveDuration = Math.random() * 12000 + 18000;
      const animationDelay = Math.random() * 30000;
      const startX = Math.random() * 100;
      const startY = Math.random() * 10 + 100;
      const endX = Math.random() * 100;
      const endY = -(Math.random() * 30 + 20);
      const keyframesName = `move-frames-${i}`;

      styleSheet += `
        @keyframes ${keyframesName} {
          from {
            transform: translate3d(${startX}vw, ${startY}vh, 0);
          }
          to {
            transform: translate3d(${endX}vw, ${endY}vh, 0);
          }
        }
      `;

      particleArray.push(
        <div
          key={i}
          className="particle"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            animationName: `fade-frames, scale-frames, ${keyframesName}`,
            animationDuration: `200ms, 2s, ${moveDuration}ms`,
            animationDelay: `${animationDelay}ms`,
            animationIterationCount: "infinite, infinite, infinite",
          }}
        />
      );
    }
    return { particleArray, styleSheet };
  }, [mounted, particleCount]); // Adiciona 'mounted' como dependência

  if (!mounted) {
    return null; // A chave: não renderiza nada no servidor
  }

  return (
    <>
      <style>{particles.styleSheet}</style>
      {particles.particleArray}
    </>
  );
};

export default ParticleBackground;
