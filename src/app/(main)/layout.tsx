"use client"; // Necessário para detectar se o usuário está logado

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
    } = supabase.auth.onAuthStateChange(async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    });

    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    fetchUser();

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
