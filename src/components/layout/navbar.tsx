// src/components/layout/navbar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
// 1. Importar o ícone de Download
import { Search, Bell, AudioLines, Download } from "lucide-react";
import { createSupabaseBrowserClient } from "@/src/lib/supabase-client";
import { User } from "@supabase/supabase-js";
import { Skeleton } from "@/src/components/ui/skeleton";
import { NavbarLoggedOut } from "./NavbarLoggedOut";
import { UserMenu } from "./user-menu";

export function Navbar() {
  const supabase = createSupabaseBrowserClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setLoading(false);
    };
    fetchUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  if (loading) {
    return (
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-white dark:bg-black/30 dark:backdrop-blur-md px-4 sm:px-6">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-8 w-48" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </header>
    );
  }

  if (!user) {
    return <NavbarLoggedOut />;
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-white dark:bg-black/30 dark:backdrop-blur-md px-4 sm:px-6">
      <Link href="/">
        <div className="flex items-center gap-4">
          <AudioLines className="h-6 w-6" />
        </div>
      </Link>
      <div className="flex items-center gap-4">
        {/* 2. Adicionar o novo botão estático aqui */}
        <Button variant="outline" size="sm" className="hidden sm:inline-flex">
          <Download className="mr-2 h-4 w-4" />
          Instalar Aplicativo
        </Button>

        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notificações</span>
        </Button>
        <UserMenu />
      </div>
    </header>
  );
}
