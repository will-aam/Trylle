// src/components/layout/admin-player-wrapper.tsx
"use client";

import AudioPlayer from "@/src/components/features/audio-player";
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
      className={cn("relative h-full w-full", activeEpisode ? "pb-20" : "pb-0")}
    >
      {children}
      <AudioPlayer />
    </div>
  );
}
