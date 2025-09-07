"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/src/components/layout/navbar";
import { BottomNavbar } from "@/src/components/layout/bottom-navbar";
import { Footer } from "@/src/components/layout/footer";
import { createClient } from "@/src/lib/supabase-client";
import { User } from "@supabase/supabase-js";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);

      // CORREÇÃO APLICADA AQUI:
      // Verificamos se 'session' não é nulo antes de usá-lo.
      if (
        event === "SIGNED_IN" &&
        session && // Garante que a sessão existe
        session.user &&
        !session.user.user_metadata.avatar_url
      ) {
        // Agora é seguro acessar o token
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
    <div className="flex min-h-screen w-full flex-col">
      <Navbar />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {children}
      </main>
      {user && <BottomNavbar />}
      <Footer />
    </div>
  );
}
