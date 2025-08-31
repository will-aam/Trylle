"use client";

import { useState } from "react";
import { AdminSidebar } from "@/src/components/layout/admin-sidebar";
import { Toaster } from "@/src/components/ui/sonner";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

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
