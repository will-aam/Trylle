// src/app/(main)/layout.tsx
"use client";

import { useEffect, useState, ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/src/lib/supabase-client";
import { Sidebar } from "@/src/components/features/home/layout/sidebar";
import { RightSidebar } from "@/src/components/features/home/layout/right-sidebar";

export default function MainLayout({ children }: { children: ReactNode }) {
  const supabase = createSupabaseBrowserClient();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
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
    <div className="h-screen w-full flex flex-col p-4 gap-4 bg-black text-white overflow-hidden">
      <div className="flex-1 flex gap-4 overflow-hidden">
        <div className="w-64 flex-shrink-0">
          <Sidebar />
        </div>

        <main className="flex-1 rounded-2xl  overflow-y-auto overflow-x-hidden">
          {children}
        </main>

        <div className="w-96 flex-shrink-0">
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}
