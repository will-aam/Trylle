"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
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
import { cn } from "@/src/lib/utils";

export function Navbar() {
  const supabase = createSupabaseBrowserClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);

  // Lógica do placeholder animado
  const placeholders = [
    "Qual tema você quer explorar hoje?",
    "Qual conversa você procura?",
    "O que você quer descobrir agora?",
    "Qual assunto te interessa?",
    "Sobre o que quer ouvir?",
  ];

  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (isTyping) return; // Se o usuário está digitando, não troca o placeholder

    const interval = setInterval(() => {
      setPlaceholderIndex((prevIndex) => (prevIndex + 1) % placeholders.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [isTyping, placeholders.length]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value && isTyping) {
      setIsTyping(false);
    } else if (e.target.value && !isTyping) {
      setIsTyping(true);
    }
  };

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
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 bg-background px-4 sm:px-6">
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
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 bg-background px-4 sm:px-6">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <AudioLines className="h-6 w-6" />
          <span className="text-lg font-bold hidden sm:inline">Trylle</span>
        </Link>
      </div>

      <div className="hidden md:flex flex-1 justify-center px-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            placeholder={placeholders[placeholderIndex]}
            onChange={handleInputChange}
            className="pl-10 h-9 rounded-full" // Alterado para borda completamente redonda
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/"
                  passHref
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-accent",
                    pathname === "/"
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
        <Button
          variant="outline"
          size="sm"
          className="hidden sm:inline-flex rounded-full"
        >
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
