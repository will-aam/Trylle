// src/app/(main)/layout.tsx
"use client";

import { useEffect, useState, ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/src/lib/supabase-client";
import { Sidebar } from "@/src/components/features/home/layout/sidebar";
import { RightSidebar } from "@/src/components/features/home/layout/right-sidebar";

// <-- NOVO: Importe o componente para usuários não logados
// Você precisará criar este componente. Ex: import { NavbarLoggedOut } from "@/src/components/layout/NavbarLoggedOut";
import { NavbarLoggedOut } from "@/src/components/layout/NavbarLoggedOut";

export default function MainLayout({ children }: { children: ReactNode }) {
  const supabase = createSupabaseBrowserClient();
  const [user, setUser] = useState<User | null>(null);
  // <-- NOVO: Adiciona estado de loading para evitar "flash"
  const [loading, setLoading] = useState(true);

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

    // <-- ALTERADO: Atualiza a função para também controlar o loading
    const fetchInitialUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setLoading(false); // <-- Define que o carregamento inicial terminou
    };

    fetchInitialUser();

    return () => subscription.unsubscribe();
  }, [supabase]);

  // <-- NOVO: Lógica de renderização condicional
  if (loading) {
    // Retorna null ou um spinner de carregamento enquanto busca o usuário
    return null;
  }

  if (!user) {
    // SE NÃO ESTIVER LOGADO: Renderiza o layout da Landing Page
    return (
      <div className="flex flex-col min-h-screen bg-black text-white">
        <NavbarLoggedOut />
        <main className="flex-grow">{children}</main>
      </div>
    );
  }

  // SE ESTIVER LOGADO: Renderiza o layout do app (o seu JSX original)
  return (
    <div className="h-screen w-full flex flex-col p-4 gap-4 bg-black text-white overflow-hidden">
      <div className="flex-1 flex gap-4 overflow-hidden">
        <div className="w-64 flex-shrink-0">
          <Sidebar />
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
