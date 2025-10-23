// src/components/features/home/home-logged-in.tsx
import { Episode } from "@/src/lib/types";
// 1. IMPORTAR DIRETAMENTE O CONTEÚDO PRINCIPAL
import { MainContent } from "./layout/main-content"; // Ajuste o caminho se necessário

interface HomeLoggedInProps {
  publishedEpisodes: Episode[]; // A prop ainda existe, mas pode não ser usada diretamente aqui
}

export function HomeLoggedIn({ publishedEpisodes }: HomeLoggedInProps) {
  // 2. RENDERIZAR APENAS O MAINCONTENT (OU SEU EQUIVALENTE)
  // Removido o MusicDashboard que continha as sidebars
  return (
    // Opcional: Adicionar padding aqui se não foi feito no layout
    // <div className="p-6">
    <MainContent />
    // </div>
  );
}
