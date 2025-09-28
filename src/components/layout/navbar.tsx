// src/components/layout/navbar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Search, Bell, AudioLines } from "lucide-react";
import { createSupabaseBrowserClient } from "@/src/lib/supabase-client";
import { User } from "@supabase/supabase-js";
import { ThemeToggle } from "./theme-toggle";
import { Skeleton } from "@/src/components/ui/skeleton";
import { NavbarLoggedOut } from "./NavbarLoggedOut";
import { UserMenu } from "./user-menu"; // AQUI ESTÁ A MUDANÇA PRINCIPAL

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
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-5 w-5" />
        </Button>

        {/* AQUI ESTÁ A SUBSTITUIÇÃO: 
          Removemos todo o <Popover> e colocamos o <UserMenu /> no lugar.
        */}
        <UserMenu />
      </div>
    </header>
  );
}
