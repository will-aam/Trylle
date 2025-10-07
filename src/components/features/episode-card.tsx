// src/components/features/episode-card.tsx
"use client";

import Image from "next/image";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Episode } from "@/src/lib/types";
import { usePlayer } from "@/src/hooks/use-player";

interface EpisodeCardProps {
  episode: Episode;
}

export function EpisodeCard({ episode }: EpisodeCardProps) {
  const { setEpisode } = usePlayer();

  const handlePlay = () => {
    if (episode) {
      setEpisode(episode);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        {episode.categories && (
          <Badge className="absolute top-3 left-3">
            {episode.categories.name}
          </Badge>
        )}
      </div>
      <div className="flex flex-col gap-3 items-center">
        <h3 className="font-semibold truncate">{episode.title}</h3>
        <Button onClick={handlePlay} className="w-32">
          Ouvir Agora
        </Button>
      </div>
    </div>
  );
}
