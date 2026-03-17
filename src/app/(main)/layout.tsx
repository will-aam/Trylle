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
import { useRouter } from "next/navigation";

export default function MainLayout({ children }: { children: ReactNode }) {
  const supabase = createSupabaseBrowserClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // ... [Código do useEffect idêntico ao seu, omitido aqui só na resposta para encurtar]
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
        router.push("/auth");
      } else {
        setUser(data.user);
      }
      setLoading(false);
    };

    fetchInitialUser();
    return () => subscription.unsubscribe();
  }, [supabase, router]);

  if (loading || !user) return null;

  return (
    <div className="h-screen w-full flex flex-col bg-black text-white overflow-hidden">
      {/* MUDANÇA: pb-24 no desktop. 
        Por quê? O player tem h-20 (80px) + p-4 da tela (16px) = 96px (pb-24). 
        Isso faz com que o espaço inferior seja milimétrico, tirando a fita preta. 
      */}
      <div className="flex-1 flex gap-4 overflow-hidden p-4 pb-40 md:pb-24">
        <div
          className={cn(
            "flex-shrink-0 transition-all duration-300 ease-in-out h-full overflow-hidden",
            "hidden md:block",
            isCollapsed ? "w-20" : "w-[260px]",
          )}
        >
          <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        </div>

        <main className="flex-1 h-full rounded-2xl overflow-y-auto overflow-x-hidden no-scrollbar">
          {" "}
          {children}
        </main>

        <div className="w-[260px] flex-shrink-0 hidden lg:block h-full overflow-hidden">
          <RightSidebar />
        </div>
      </div>

      <div className="fixed bottom-20 left-0 right-0 z-40 md:hidden">
        <BottomNavbar />
      </div>

      <AudioPlayer />
    </div>
  );
}
