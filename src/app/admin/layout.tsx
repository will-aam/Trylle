// src/app/admin/layout.tsx
"use client";

import { useState, useEffect } from "react";
import { AdminSidebar } from "@/src/components/layout/admin-sidebar";
import { Skeleton } from "@/src/components/ui/skeleton";
import { AdminPlayerWrapper } from "@/src/components/layout/admin-player-wrapper";
import { useIsMobile } from "@/src/hooks/use-mobile";
import { Button } from "@/src/components/ui/button";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/src/components/ui/sheet";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    setIsMounted(true);
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

  // Versão para desktop - mantida exatamente como estava
  if (!isMobile) {
    return (
      <div className="flex h-screen">
        <AdminSidebar
          isCollapsed={isSidebarCollapsed}
          setCollapsed={() => setSidebarCollapsed((prev) => !prev)}
        />

        <AdminPlayerWrapper>
          <main
            className={`flex-1 overflow-y-auto transition-all duration-300 ${
              isSidebarCollapsed ? "pl-16" : "pl-64"
            }`}
          >
            {children}
          </main>
        </AdminPlayerWrapper>
      </div>
    );
  }

  // Versão para mobile
  return (
    <div className="flex h-screen bg-muted/40">
      {/* Botão flutuante para abrir a sidebar no mobile */}
      <div className="fixed top-4 left-4 z-50">
        <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="bg-background">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <SheetHeader className="sr-only">
              <SheetTitle>Menu de Navegação</SheetTitle>
            </SheetHeader>
            <AdminSidebar
              isCollapsed={false}
              setCollapsed={() => {}}
              isMobile={true}
              onCloseSidebar={() => setIsMobileSidebarOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>

      <AdminPlayerWrapper>
        <main className="flex-1 overflow-y-auto pt-16">{children}</main>
      </AdminPlayerWrapper>
    </div>
  );
}
