// src/components/features/home/layout/waveform-visualizer.tsx
"use client";

import { useEffect, useState } from "react";

export function WaveformVisualizer() {
  const [bars, setBars] = useState<number[]>([]);

  useEffect(() => {
    const generateBars = () => {
      const newBars = Array.from({ length: 60 }, () => Math.random() * 100);
      setBars(newBars);
    };

    generateBars();
    const interval = setInterval(generateBars, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      // MUDANÇA: Adicionamos `min-h` para redundância e garantia.
      // `h-24` = 96px. `min-h-[96px]` reforça que essa é a altura mínima.
      className="flex items-center justify-center gap-1 h-24 min-h-[96px] flex-shrink-0"
    >
      {bars.map((height, index) => (
        <div
          key={index}
          className="w-1 rounded-full transition-all duration-200 ease-out"
          style={{
            height: `${height}%`,
            backgroundColor: "white",
          }}
        />
      ))}
    </div>
  );
}
