"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar";
import { Input } from "@/src/components/ui/input";
import { Search, Bell } from "lucide-react";
import { createClient } from "@/src/lib/supabase-client";
import { User } from "@supabase/supabase-js";
import { ThemeToggle } from "./theme-toggle";
import { Skeleton } from "@/src/components/ui/skeleton";

export function Navbar() {
  const supabase = createClient();
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

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background/95 px-4 backdrop-blur-sm sm:px-6">
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    // Se o usuário estiver logado, usa o avatar dele. Se não, usa o padrão.
                    src={user?.user_metadata?.avatar_url || defaultAvatarUrl}
                    alt={user?.user_metadata?.name || "Avatar Padrão"}
                  />
                  <AvatarFallback>
                    {user?.email?.charAt(0).toUpperCase() || "P"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {user ? (
                <>
                  <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Perfil</DropdownMenuItem>
                  <DropdownMenuItem>Biblioteca</DropdownMenuItem>
                  <DropdownMenuItem>Configurações</DropdownMenuItem>
                  <DropdownMenuItem>Pagamentos</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    Sair
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/login">Login</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/signup">Cadastro</Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
