// src/components/pwa-updater.tsx
"use client";

import { useEffect } from "react";
// CORREÇÃO: Importando do seu safe-toast ao invés do sonner direto
import { toast } from "@/src/lib/safe-toast";

export function PwaUpdater() {
  useEffect(() => {
    // Verifica se estamos no navegador e se há suporte a Service Worker
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const handleControllerChange = () => {
      // Esse evento é disparado assim que o novo Service Worker assume o controle.
      toast("Atualização do Sistema", {
        description:
          "Uma nova versão do Trylle foi instalada em segundo plano.",
        action: {
          label: "Atualizar agora",
          onClick: () => window.location.reload(),
        },
        duration: Number.POSITIVE_INFINITY, // O toast fica na tela até o usuário agir
        dismissible: false, // Evita que o usuário feche sem querer
      });
    };

    // Fica escutando as mudanças no Service Worker
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      handleControllerChange,
    );

    return () => {
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        handleControllerChange,
      );
    };
  }, []);

  return null; // É um componente invisível, ele só monitora os eventos
}
