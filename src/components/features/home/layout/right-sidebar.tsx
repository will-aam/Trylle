// src/components/features/home/layout/right-sidebar.tsx
"use client";

import { Bell, Settings } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

export function RightSidebar() {
  const getGreeting = useMemo(() => {
    const now = new Date();
    const hourInSaoPaulo = new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
      hour: "numeric",
      hour12: false,
    })
      .formatToParts(now)
      .find((part) => part.type === "hour")?.value;

    const hour = parseInt(hourInSaoPaulo ?? "0", 10);

    if (hour >= 6 && hour < 12) return "Bom dia!";
    if (hour >= 12 && hour < 18) return "Boa tarde!";
    return "Boa noite!";
  }, []);

  return (
    // MUDANÇA: Adicionado overflow-hidden e h-full
    <aside className="h-full w-full rounded-2xl bg-card/80 shadow-lg backdrop-blur-md flex flex-col overflow-hidden">
      {/* Header com flex-shrink-0 para nunca amassar */}
      <div className="p-6 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
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

      {/* Se no futuro você adicionar algo rolável abaixo do header, será aqui: */}
      {/* <div className="flex-1 overflow-y-auto min-h-0 p-6"> ... </div> */}
    </aside>
  );
}
