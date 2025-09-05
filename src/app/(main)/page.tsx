"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/src/lib/supabase-client";
import { User } from "@supabase/supabase-js";
import { HomeLoggedIn } from "@/src/components/features/home-logged-in";
import { HomeLoggedOut } from "@/src/components/features/home-logged-out";
import { Skeleton } from "@/src/components/ui/skeleton";

export default function HomePage() {
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

  // Mostra um esqueleto de carregamento enquanto verifica o estado de login
  if (loading) {
    return (
      <div className="space-y-12">
        <Skeleton className="h-64 w-full" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/4" />
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }
  return user ? <HomeLoggedIn /> : <HomeLoggedOut />;
}
