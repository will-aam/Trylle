// src/components/features/home/layout/music-dashboard.tsx
import { Sidebar } from "./sidebar";
import { MainContent } from "./main-content";
import { RightSidebar } from "./right-sidebar";

export default function MusicDashboard() {
  return (
    // 1. REMOVIDO p-4, ADICIONADO py-4 (padding vertical)
    <div className="h-screen flex flex-col bg-black text-white py-4 gap-4">
      {/* 2. ADICIONADO px-4 (padding horizontal) aqui */}
      <main className="flex-1 flex gap-4 overflow-hidden px-4">
        {/* 3. MUDADO de w-1/4 para w-64 (largura fixa) */}
        {/* Esta div NÃO tem 'pl-4', então a sidebar fica na borda esquerda */}
        <div className="w-64 flex-shrink-0">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <MainContent />
        </div>

        {/* Right Sidebar */}
        <div className="w-1/4 flex-shrink-0">
          <RightSidebar />
        </div>
      </main>
    </div>
  );
}
