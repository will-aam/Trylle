"use client";

import { usePlayer } from "@/src/hooks/use-player";
import { cn } from "@/src/lib/utils";
import { AudioPlayer } from "@/src/components/features/audio-player";

export function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { activeEpisode } = usePlayer();

  return (
    // Adiciona o padding-bottom dinâmico aqui
    <div
      className={cn("relative min-h-screen", activeEpisode ? "pb-20" : "pb-0")}
    >
      {children}
      <AudioPlayer />
    </div>
  );
}
