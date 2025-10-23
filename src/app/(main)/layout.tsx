// src/app/(main)/layout.tsx
"use client";

import { useEffect, useState, ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/src/lib/supabase-client";
import { BottomNavbar } from "@/src/components/layout/bottom-navbar";

export default function MainLayout({ children }: { children: ReactNode }) {
  const supabase = createSupabaseBrowserClient(); // Mantém o uso correto
  const [user, setUser] = useState<User | null>(null);

  // Lógica do seu useEffect original restaurada, que é mais completa
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);

      // Sua lógica para definir o avatar, agora funcionando com o cliente correto
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
    };
    fetchInitialUser();

    return () => subscription.unsubscribe();
  }, [supabase]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <main className="flex flex-1 flex-col gap-4 md:gap-8 overflow-hidden">
        {children}
      </main>
      {user && <BottomNavbar />}
    </div>
  );
}
