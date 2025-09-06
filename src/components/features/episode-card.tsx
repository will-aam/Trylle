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

  // Fallback image caso a URL não seja fornecida
  const imageUrl =
    episode.imageUrl || "/Whisk_dbc581f98f.jpg?height=200&width=300";

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Image
          src={imageUrl}
          alt={episode.title}
          width={300}
          height={168}
          className="rounded-xl aspect-video object-cover w-full"
        />
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
