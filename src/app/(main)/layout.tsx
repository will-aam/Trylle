// src/app/(main)/layout.tsx
"use client";

import { useEffect, useState, ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/src/lib/supabase-client";
import { Sidebar } from "@/src/components/features/home/layout/sidebar";
import { RightSidebar } from "@/src/components/features/home/layout/right-sidebar";
import { NavbarLoggedOut } from "@/src/components/layout/NavbarLoggedOut";
// NOVOS IMPORTS PARA RESPONSIVIDADE E ESTADO DA SIDEBAR
import { BottomNavbar } from "@/src/components/layout/bottom-navbar";
import { cn } from "@/src/lib/utils";

export default function MainLayout({ children }: { children: ReactNode }) {
  const supabase = createSupabaseBrowserClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  // NOVO ESTADO PARA CONTROLAR SE A SIDEBAR ESTÁ ENCOLHIDA
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

  // LÓGICA DE CARREGAMENTO E USUÁRIO NÃO LOGADO (MANTIDA)
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

  // LAYOUT PARA USUÁRIO LOGADO (ATUALIZADO E RESPONSIVO)
  return (
    // O container raiz NÃO deve ter padding ou overflow
    <div className="h-screen w-full flex flex-col bg-black text-white">
      {/* 1. Área de Conteúdo (Sidebars + Main) 
          Este div agora tem o padding e o gap
      */}
      <div className="flex-1 flex gap-4 overflow-hidden p-4">
        {/* 2. Div da Sidebar Esquerda (Escondida no mobile) */}
        <div
          className={cn(
            "flex-shrink-0 transition-all duration-300 ease-in-out",
            "hidden md:block", // <-- ESCONDE NO MOBILE (telas < 768px)
            isCollapsed ? "w-20" : "w-64"
          )}
        >
          <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        </div>

        {/* 3. Conteúdo Principal */}
        <main className="flex-1 rounded-2xl overflow-y-auto overflow-x-hidden">
          {children}
        </main>

        {/* 4. Div da Sidebar Direita (Escondida no mobile e tablet) */}
        <div className="w-96 flex-shrink-0 hidden lg:block">
          {" "}
          {/* <-- ESCONDE EM TELAS < 1024px */}
          <RightSidebar />
        </div>
      </div>

      {/* 5. Navbar Mobile (Mostrada apenas no mobile) */}
      <div className="md:hidden">
        {" "}
        {/* <-- MOSTRA APENAS NO MOBILE */}
        <BottomNavbar />
      </div>

      {/* 6. Player Global (Seu player pode ir aqui, fora da área de scroll) */}
      {/* <div className="w-full flex-shrink-0">
        <Player />
      </div> */}
    </div>
  );
}
