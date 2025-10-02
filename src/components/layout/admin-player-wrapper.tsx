"use client";

import { AudioPlayer } from "@/src/components/features/audio-player";
import { usePlayer } from "@/src/hooks/use-player";
import { cn } from "@/src/lib/utils";

export function AdminPlayerWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { activeEpisode } = usePlayer();

  return (
    <div
      // A classe 'pb-20' adiciona um espaçamento na parte inferior
      // somente quando um áudio estiver ativo, evitando que o player
      // sobreponha o conteúdo da página.
      className={cn("relative h-full w-full", activeEpisode ? "pb-20" : "pb-0")}
    >
      {children}
      <AudioPlayer />
    </div>
  );
}
