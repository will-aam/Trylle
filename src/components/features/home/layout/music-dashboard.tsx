import { Sidebar } from "./sidebar";
import { MainContent } from "./main-content";
import { RightSidebar } from "./right-sidebar";

export default function MusicDashboard() {
  return (
    <div className="relative h-screen bg-[#0a0a0a] text-white overflow-hidden">
      <div className="mx-auto h-full max-w-[1600px] px-4">
        <div className="flex h-full gap-4">
          {/* Painel esquerdo flutuante */}
          <div className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-4 h-[calc(100vh-2rem)]">
              <Sidebar />
            </div>
          </div>

          {/* Conteúdo central (rolagem será finalizada no Passo 4) */}
          <div className="flex-1 min-w-0">
            <div className="h-[calc(100vh-2rem)]">
              <MainContent />
            </div>
          </div>

          {/* Painel direito flutuante */}
          <div className="hidden xl:block w-96 shrink-0">
            <div className="sticky top-4 h-[calc(100vh-2rem)]">
              <RightSidebar />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
