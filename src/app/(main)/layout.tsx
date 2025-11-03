// src/app/(main)/layout.tsx
"use client";

import { useEffect, useState, ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/src/lib/supabase-client";
import { Sidebar } from "@/src/components/features/home/layout/sidebar";
import { RightSidebar } from "@/src/components/features/home/layout/right-sidebar";
import { NavbarLoggedOut } from "@/src/components/layout/NavbarLoggedOut";
import { cn } from "@/src/lib/utils"; // <-- NOVO: Importe o cn

export default function MainLayout({ children }: { children: ReactNode }) {
  const supabase = createSupabaseBrowserClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false); // <-- NOVO: Estado da sidebar

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
      </div>
    );
  }

  // SE ESTIVER LOGADO: Renderiza o layout do app (ATUALIZADO)
  return (
    <div className="h-screen w-full flex flex-col p-4 gap-4 bg-black text-white overflow-hidden">
      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Div da Sidebar com largura dinâmica e props passadas */}
        <div
          className={cn(
            "flex-shrink-0 transition-all duration-300 ease-in-out",
            isCollapsed ? "w-20" : "w-64" // <-- LARGURA DINÂMICA
          )}
        >
          <Sidebar
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed} // <-- PASSANDO AS PROPS
          />
        </div>

        <main className="flex-1 rounded-2xl overflow-y-auto overflow-x-hidden">
          {children}
        </main>

        <div className="w-96 flex-shrink-0">
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}
