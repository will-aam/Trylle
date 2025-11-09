/* eslint-disable @next/next/no-img-element */
// src/components/features/home/layout/right-sidebar.tsx
"use client";

import { Bell, Settings } from "lucide-react";

import Link from "next/link";
import { useMemo } from "react";

export function RightSidebar() {
  // Lógica da saudação MELHORADA
  const getGreeting = useMemo(() => {
    // 1. Pega a hora atual no fuso horário de São Paulo
    const now = new Date();
    const hourInSaoPaulo = new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
      hour: "numeric",
      hour12: false, // Usa formato 24h
    })
      .formatToParts(now)
      .find((part) => part.type === "hour")?.value;

    const hour = parseInt(hourInSaoPaulo ?? "0", 10);

    // 2. Lógica de saudação mais realista
    if (hour >= 6 && hour < 12) {
      return "Bom dia!";
    }
    if (hour >= 12 && hour < 18) {
      return "Boa tarde!";
    }
    return "Boa noite!";
  }, []); // O array de dependências vazio significa que isso só será recalculado se o componente for "montado" novamente.
  // Para ser perfeito, poderíamos usar um timer, mas para a maioria dos casos, isso já é uma ótima melhoria.

  return (
    <aside className="h-full w-full rounded-2xl bg-card/80 shadow-lg backdrop-blur-md flex flex-col">
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
              <p className="text-xs text-muted-foreground font-medium">
                {getGreeting}
              </p>
              <h3 className="text-sm font-semibold text-foreground">William</h3>
            </div>
          </div>

          {/* Container dos botões - mesmo tamanho do perfil */}
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-full bg-muted/50 hover:bg-muted/80 flex items-center justify-center transition-all hover:scale-110">
              <Bell className="w-5 h-5 text-muted-foreground" />
            </button>

            <Link href="/settings">
              <button className="w-10 h-10 rounded-full bg-muted/50 hover:bg-muted/80 flex items-center justify-center transition-all hover:scale-110">
                <Settings className="w-5 h-5 text-muted-foreground" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
