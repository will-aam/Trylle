// src/components/layout/admin-player-wrapper.tsx
"use client";

// Corrigido: Usando a importação 'default' que seu projeto utiliza
import AudioPlayer from "@/src/components/features/audio-player";
import { ReactNode } from "react";

/**
 * Este wrapper garante que o contexto do player e a lógica de áudio
 * estejam ativos no painel de admin, mas esconde a UI (a barra fixa).
 */
export function AdminPlayerWrapper({ children }: { children: ReactNode }) {
  return (
    <>
      {/* 1. Renderiza o conteúdo principal da página (seus {children}) 
            sem o wrapper <div cm padding> que existia antes.
      */}
      {children}

      {/* 2. Renderiza o AudioPlayer dentro de uma div com "hidden".
           Isso carrega a LÓGICA do player (para o som tocar)
           mas esconde a INTERFACE (a barra fixa).
      */}
      <div className="hidden">
        <AudioPlayer />
      </div>
    </>
  );
}
