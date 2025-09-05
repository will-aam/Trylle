"use client";

import { Card } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Play, Music } from "lucide-react"; // Usaremos o ícone de Música como placeholder
import { Episode } from "@/src/lib/types";
import { usePlayer } from "@/src/hooks/use-player";

interface EpisodeCardProps {
  episode: Episode & { duration?: string }; // Adicionamos a duração opcional para dados estáticos
}

export function EpisodeCard({ episode }: EpisodeCardProps) {
  const { setEpisode } = usePlayer();

  const handlePlay = () => {
    setEpisode(episode);
  };

  return (
    <Card className="rounded-lg overflow-hidden group bg-muted/50 hover:bg-muted transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 p-3">
          <div className="h-12 w-12 bg-secondary rounded-md flex items-center justify-center flex-shrink-0">
            <Music className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="truncate">
            <h3 className="text-sm font-semibold truncate">{episode.title}</h3>
            <p className="text-xs text-muted-foreground">
              {episode.duration || "45 min"}
            </p>
          </div>
        </div>
        <Button
          onClick={handlePlay}
          size="icon"
          variant="ghost"
          className="mr-3 h-10 w-10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
        >
          <Play className="h-5 w-5 fill-current" />
        </Button>
      </div>
    </Card>
  );
}
