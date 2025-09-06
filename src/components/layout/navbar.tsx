"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { useRef } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
} from "@/src/components/ui/popover";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar";
import { Input } from "@/src/components/ui/input";
import { Search, Bell, AudioLines } from "lucide-react";
import { createClient } from "@/src/lib/supabase-client";
import { User } from "@supabase/supabase-js";
import { ThemeToggle } from "./theme-toggle";
import { Skeleton } from "@/src/components/ui/skeleton";

export function Navbar() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const avatarRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setLoading(false);
    };
    fetchUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // URL do avatar padrão para usuários deslogados
  const defaultAvatarUrl =
    "https://api.dicebear.com/9.x/thumbs/svg?seed=Destiny";

  // Detecta se está em mobile (simplificado, pode melhorar)
  const isMobile =
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: coarse)").matches;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-white dark:bg-black/30 dark:backdrop-blur-md px-4 sm:px-6">
      {" "}
      <Link href="/">
        <div className="flex items-center gap-4">
          <AudioLines className="h-6 w-6" />
        </div>
      </Link>
      <div className="relative flex-1 md:grow-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar episódios..."
          className="w-full rounded-lg bg-muted pl-8 md:w-[200px] lg:w-[320px]"
        />
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-5 w-5" />
        </Button>

        {loading ? (
          <Skeleton className="h-8 w-8 rounded-full" />
        ) : (
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                ref={avatarRef}
                variant="ghost"
                size="icon"
                className="rounded-full"
                onMouseEnter={() => setPopoverOpen(true)}
                onMouseLeave={() => setPopoverOpen(false)}
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage
                    src={user?.user_metadata?.avatar_url || defaultAvatarUrl}
                    alt={user?.user_metadata?.name || "Avatar Padrão"}
                  />
                  <AvatarFallback>
                    {user?.email?.charAt(0).toUpperCase() || "P"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-48 p-2 z-50 bg-background shadow-lg border rounded-md"
              onMouseEnter={() => setPopoverOpen(true)}
              onMouseLeave={() => setPopoverOpen(false)}
            >
              <PopoverArrow />
              {user ? (
                <div className="flex flex-col gap-1">
                  <div className="px-3 py-2 text-xs text-muted-foreground">
                    Minha Conta
                  </div>
                  <Link
                    href="/profile"
                    className="hover:bg-accent rounded px-3 py-2 text-sm"
                  >
                    Perfil
                  </Link>
                  <Link
                    href="/library"
                    className="hover:bg-accent rounded px-3 py-2 text-sm"
                  >
                    Biblioteca
                  </Link>
                  <Link
                    href="/settings"
                    className="hover:bg-accent rounded px-3 py-2 text-sm"
                  >
                    Configurações
                  </Link>
                  <Link
                    href="/payments"
                    className="hover:bg-accent rounded px-3 py-2 text-sm"
                  >
                    Pagamentos
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="hover:bg-accent rounded px-3 py-2 text-sm text-left"
                  >
                    Sair
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  <Link
                    href="/login"
                    className="hover:bg-accent rounded px-3 py-2 text-sm"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="hover:bg-accent rounded px-3 py-2 text-sm"
                  >
                    Cadastro
                  </Link>
                </div>
              )}
            </PopoverContent>
          </Popover>
        )}
      </div>
    </header>
  );
}
