"use client";

import { useState, useEffect } from "react";
import { AdminSidebar } from "@/src/components/layout/admin-sidebar";
import { Toaster } from "@/src/components/ui/sonner";
import { Skeleton } from "@/src/components/ui/skeleton";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Tela de carregamento durante a hidratação - DEVE SER IDÊNTICA ao layout real
  if (!isMounted) {
    return (
      <div className="flex h-screen bg-muted/40">
        {/* Sidebar Skeleton - DEVE usar a mesma estrutura e classes do AdminSidebar real */}
        <aside className="fixed inset-y-0 left-0 z-10 flex flex-col border-r bg-background transition-all duration-300 w-16">
          <div className="flex flex-col items-center py-4 gap-4">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </aside>

        {/* Conteúdo principal Skeleton */}
        <main className="flex-1 overflow-y-auto pl-16">
          <div className="p-4 sm:p-6 md:p-8">
            <Skeleton className="h-10 w-1/3 mb-6" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        </main>
      </div>
    );
  }

  // Layout real após a montagem
  return (
    <div className="flex h-screen bg-muted/40">
      <AdminSidebar
        isCollapsed={isSidebarCollapsed}
        setCollapsed={() => setSidebarCollapsed((prev) => !prev)}
      />

      <main
        className={`flex-1 overflow-y-auto transition-all duration-300 ${
          isSidebarCollapsed ? "pl-16" : "pl-64"
        }`}
      >
        {children}
      </main>

      <Toaster position="top-center" richColors />
    </div>
  );
}
