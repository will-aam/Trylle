"use client";

import { useEffect, useState } from "react";

export function WaveformVisualizer() {
  const [bars, setBars] = useState<number[]>([]);

  useEffect(() => {
    // Generate random heights for waveform bars
    const generateBars = () => {
      const newBars = Array.from({ length: 60 }, () => Math.random() * 100);
      setBars(newBars);
    };

    generateBars();
    const interval = setInterval(generateBars, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center gap-1 h-24">
      {bars.map((height, index) => (
        <div
          key={index}
          className="w-1 rounded-full transition-all duration-200"
          style={{
            height: `${height}%`,
            backgroundColor: index < 30 ? "#84cc16" : "#d4d4d4",
          }}
        />
      ))}
    </div>
  );
}
