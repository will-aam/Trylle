"use client";

import { useState, useEffect } from "react";
import { AdminSidebar } from "@/src/components/layout/admin-sidebar";
import { Toaster } from "@/src/components/ui/sonner";
import { Skeleton } from "@/src/components/ui/skeleton";
import { AdminPlayerWrapper } from "@/src/components/layout/admin-player-wrapper";
import { Button } from "@/src/components/ui/button";
import { Menu } from "lucide-react";
import { cn } from "@/src/lib/utils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Colapsa por padrão no mobile
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setSidebarCollapsed(true);
    }
  }, []);

  if (!isMounted) {
    return (
      <div className="flex h-screen bg-muted/40">
        <aside className="fixed inset-y-0 left-0 z-10 flex flex-col border-r bg-background transition-all duration-300 w-16">
          <div className="flex flex-col items-center py-4 gap-4">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </aside>
        <main className="flex-1 overflow-y-auto pl-16">
          <div className="p-4 sm:p-6 md:p-8">
            <Skeleton className="h-10 w-1/3 mb-6" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-muted/40">
      {/* Botão flutuante para abrir a sidebar no mobile quando estiver fechada */}
      {isSidebarCollapsed && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarCollapsed(false)}
          className={cn(
            "fixed left-3 top-3 z-50 md:hidden h-9 w-9 rounded-full shadow",
            "bg-background/90 supports-[backdrop-filter]:bg-background/70 backdrop-blur"
          )}
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}

      <AdminSidebar
        isCollapsed={isSidebarCollapsed}
        setCollapsed={() => setSidebarCollapsed((prev) => !prev)}
      />

      <AdminPlayerWrapper>
        <main
          className={cn(
            "flex-1 overflow-y-auto transition-all duration-300",
            // No mobile não aplicamos padding-left; no desktop reservamos espaço conforme colapso
            isSidebarCollapsed ? "md:pl-16" : "md:pl-64"
          )}
        >
          {children}
        </main>
      </AdminPlayerWrapper>

      <Toaster position="top-center" richColors />
    </div>
  );
}
