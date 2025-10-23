"use client";

import { Bell, Settings } from "lucide-react";
import { NowPlaying } from "./now-playing";
import Link from "next/link";

export function RightSidebar() {
  // Lógica da saudação
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia!";
    if (hour < 18) return "Boa tarde!";
    return "Boa noite!";
  };

  return (
    <aside className="h-full w-full rounded-2xl bg-[#0f0f0f]/80  shadow-lg backdrop-blur-md flex flex-col">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center justify-between">
          {/* Container do perfil */}
          <div className="flex items-center gap-3">
            <img
              src="https://api.dicebear.com/9.x/thumbs/svg?seed=Felix"
              alt="Avatar do Usuário"
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p className="text-xs text-gray-500 font-medium">
                {getGreeting()}
              </p>
              <h3 className="text-sm font-semibold text-white">William</h3>
            </div>
          </div>

          {/* Container dos botões - mesmo tamanho do perfil */}
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all hover:scale-110">
              <Bell className="w-5 h-5 text-gray-400" />
            </button>

            <Link href="/settings">
              <button className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all hover:scale-110">
                <Settings className="w-5 h-5 text-gray-400" />
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        <NowPlaying />
      </div>
    </aside>
  );
}
