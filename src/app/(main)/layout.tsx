// src/app/(main)/layout.tsx
"use client";

import { useEffect, useState, ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/src/lib/supabase-client";
import { Sidebar } from "@/src/components/features/home/layout/sidebar";
import { RightSidebar } from "@/src/components/features/home/layout/right-sidebar";
import { NavbarLoggedOut } from "@/src/components/layout/NavbarLoggedOut";
import { BottomNavbar } from "@/src/components/layout/bottom-navbar";
import { cn } from "@/src/lib/utils";
import AudioPlayer from "@/src/components/features/audio-player"; // 1. Importamos o Player

export default function MainLayout({ children }: { children: ReactNode }) {
  const supabase = createSupabaseBrowserClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (
        event === "SIGNED_IN" &&
        session &&
        session.user &&
        !session.user.user_metadata.avatar_url
      ) {
        const token = session.access_token;
        fetch("/api/set-avatar", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }).catch((error) => console.error("Falha ao definir avatar:", error));
      }
    });

    const fetchInitialUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setLoading(false);
    };

    fetchInitialUser();

    return () => subscription.unsubscribe();
  }, [supabase]);

  if (loading) {
    return null;
  }

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen bg-black text-white">
        <NavbarLoggedOut />
        <main className="flex-grow">{children}</main>
        {/* Player não é renderizado se não há usuário */}
      </div>
    );
  }

  // LAYOUT LOGADO
  return (
    <div className="h-screen w-full flex flex-col bg-black text-white">
      {/* 2. Container principal 'flex-1' com 'overflow-hidden' (correto) */}
      <div className="flex-1 flex gap-4 overflow-hidden p-4">
        <div
          className={cn(
            "flex-shrink-0 transition-all duration-300 ease-in-out",
            "hidden md:block",
            isCollapsed ? "w-20" : "w-[260px]"
          )}
        >
          <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        </div>

        {/* 3. PADDING ADICIONADO AO <main>
           O padding-bottom vai aqui, no elemento que scrolla.
           Mobile: pb-36 (h-20 player + h-16 nav)
           Desktop: md:pb-20 (só o h-20 player)
        */}
        <main className="flex-1 rounded-2xl overflow-y-auto overflow-x-hidden pb-36 md:pb-20">
          {children}
        </main>

        <div className="w-[260px] flex-shrink-0 hidden lg:block">
          <RightSidebar />
        </div>
      </div>

      {/* 4. CONTAINER DA BOTTOMNAVBAR MODIFICADO
           Movemos ela do fluxo normal para 'fixed'.
           Ela agora fica no 'bottom-20' (acima do player) e 'z-40'.
           (Estou assumindo h-16 (4rem) para a BottomNavbar)
      */}
      <div className="fixed bottom-20 left-0 right-0 z-40 md:hidden">
        <BottomNavbar />
      </div>

      {/* 5. PLAYER ADICIONADO
           Ele renderiza aqui. O componente (do Passo 1) já é 
           'fixed bottom-0 z-50 h-20'.
      */}
      <AudioPlayer />
    </div>
  );
}
