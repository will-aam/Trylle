// src/components/layout/navbar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
// 1. Importar os ícones necessários
import { Search, Bell, AudioLines, Download, Home } from "lucide-react";
import { createSupabaseBrowserClient } from "@/src/lib/supabase-client";
import { User } from "@supabase/supabase-js";
import { Skeleton } from "@/src/components/ui/skeleton";
import { NavbarLoggedOut } from "./NavbarLoggedOut";
import { UserMenu } from "./user-menu";
import { usePathname } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function Navbar() {
  const supabase = createSupabaseBrowserClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname(); // Hook para saber a rota atual

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
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4  bg-white dark:bg-black/30 dark:backdrop-blur-md px-4 sm:px-6">
        <Skeleton className="h-6 w-24" />
        <div className="hidden md:block">
          <Skeleton className="h-8 w-64" />
        </div>
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
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4  bg-white dark:bg-black/30 dark:backdrop-blur-md px-4 sm:px-6">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <AudioLines className="h-6 w-6" />
          <span className="text-lg font-bold hidden sm:inline">Trylle</span>
        </Link>
        {/* Adiciona o link de Início para Desktop */}
      </div>

      {/* Barra de Pesquisa para Desktop */}
      <div className="hidden md:flex flex-1 justify-center px-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="O que você quer ouvir?" className="pl-10 h-9" />
        </div>
      </div>
      <div className="hidden md:flex items-center gap-3">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/"
                passHref
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-accent",
                  pathname === "/" && "bg-accent"
                )}
              >
                <Home className="h-6 w-6" />
                <span className="sr-only">Início</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent
              sideOffset={8}
              className="border-0 bg-black text-white rounded-md"
            >
              <p>Início</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="flex items-center gap-2">
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
