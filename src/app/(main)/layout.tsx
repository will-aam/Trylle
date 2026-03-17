// src/app/(main)/layout.tsx
"use client";

import { useEffect, useState, ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/src/lib/supabase-client";
import { Sidebar } from "@/src/components/features/home/layout/sidebar";
import { RightSidebar } from "@/src/components/features/home/layout/right-sidebar";
import { BottomNavbar } from "@/src/components/layout/bottom-navbar";
import { cn } from "@/src/lib/utils";
import AudioPlayer from "@/src/components/features/audio-player";
import { useRouter } from "next/navigation"; // 1. Adicionado o router

export default function MainLayout({ children }: { children: ReactNode }) {
  const supabase = createSupabaseBrowserClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();

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
      if (!data.user) {
        // Se não tiver usuário no carregamento inicial do cliente, chuta pro auth
        router.push("/auth");
      } else {
        setUser(data.user);
      }
      setLoading(false);
    };

    fetchInitialUser();

    return () => subscription.unsubscribe();
  }, [supabase, router]);

  if (loading) {
    return null;
  }

  // Se não tem usuário, não renderiza nada enquanto o router.push("/auth") faz o trabalho dele
  if (!user) {
    return null;
  }

  // LAYOUT LOGADO
  return (
    <div className="h-screen w-full flex flex-col bg-black text-white">
      {/* Container principal 'flex-1' com 'overflow-hidden' */}
      <div className="flex-1 flex gap-4 overflow-hidden p-4">
        <div
          className={cn(
            "flex-shrink-0 transition-all duration-300 ease-in-out",
            "hidden md:block",
            isCollapsed ? "w-20" : "w-[260px]",
          )}
        >
          <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        </div>

        {/* PADDING ADICIONADO AO <main> */}
        <main className="flex-1 rounded-2xl overflow-y-auto overflow-x-hidden pb-36 md:pb-20">
          {children}
        </main>

        <div className="w-[260px] flex-shrink-0 hidden lg:block">
          <RightSidebar />
        </div>
      </div>

      {/* CONTAINER DA BOTTOMNAVBAR MODIFICADO */}
      <div className="fixed bottom-20 left-0 right-0 z-40 md:hidden">
        <BottomNavbar />
      </div>

      {/* PLAYER ADICIONADO */}
      <AudioPlayer />
    </div>
  );
}
