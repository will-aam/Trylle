"use client";

import { useState, useEffect } from "react";
import { Bell, Settings, Search } from "lucide-react";
import Image from "next/image";
import { TopArtists } from "./top-artists";
import { NowPlaying } from "./now-playing";

export function RightSidebar() {
  // Lógica do placeholder animado
  const placeholders = [
    "Qual tema você quer explorar hoje?",
    "Qual conversa você procura?",
    "O que você quer descobrir agora?",
    "Qual assunto te interessa?",
    "Sobre o que quer ouvir?",
  ];

  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (isTyping) return;

    const interval = setInterval(() => {
      setPlaceholderIndex((prevIndex) => (prevIndex + 1) % placeholders.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [isTyping, placeholders.length]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value && isTyping) {
      setIsTyping(false);
    } else if (e.target.value && !isTyping) {
      setIsTyping(true);
    }
  };

  return (
    <aside className="w-96 bg-[#0f0f0f] border-l border-white/5 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden">
              <Image
                src="/artist-portrait-1.jpg"
                alt="Trignix Infotech"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Trignix Infotech
              </h3>
              <span className="inline-block px-2 py-0.5 bg-emerald-500 text-white text-xs rounded-full">
                Premium
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
              <Bell className="w-4 h-4 text-gray-400" />
            </button>
            <button className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
              <Settings className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={placeholders[placeholderIndex]}
            onChange={handleInputChange}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <TopArtists />
        <NowPlaying />
      </div>
    </aside>
  );
}
