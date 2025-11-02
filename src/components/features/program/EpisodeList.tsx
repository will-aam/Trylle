// src/components/features/program/EpisodeList.tsx
"use client";

import { Episode } from "@/src/lib/types";
import { Play } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

// O hook do player que já temos no projeto
// import { usePlayer } from "@/src/hooks/use-player";

interface EpisodeListProps {
  // A lista de episódios vinda do nosso getProgramWithEpisodes
  episodes: Episode[];
}

export function EpisodeList({ episodes }: EpisodeListProps) {
  // Vamos instanciar o player (descomente quando for integrar)
  // const player = usePlayer();

  const handlePlay = (episode: Episode) => {
    // Aqui é onde chamamos o player global
    // player.playEpisode(episode); // (ou a função que criamos no hook)
    console.log("Tocar episódio:", episode.title);
  };

  if (!episodes || episodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 border border-dashed rounded-md">
        <p className="text-muted-foreground">
          Nenhum episódio publicado neste programa ainda.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {/* HEADER DA TABELA - Visível apenas em desktop (md:)
        Isso imita o layout do Spotify
      */}
      <div
        className={cn(
          "hidden md:grid items-center gap-4 px-4 py-2",
          "text-muted-foreground text-sm font-medium",
          "grid-cols-[2rem_1fr_4rem]" // Define as colunas: #, Título, Play
        )}
      >
        <div className="text-right">#</div>
        <div>Título</div>
        <div className="text-right"></div> {/* Espaço para o botão */}
      </div>

      {/* LISTA DE EPISÓDIOS */}
      {episodes.map((episode) => (
        <div
          key={episode.id}
          className={cn(
            "grid items-center gap-4 px-4 py-3 rounded-md",
            "hover:bg-muted/50 transition-colors group", // Efeito de hover
            "grid-cols-[2rem_1fr_4rem]" // Mesma grid para alinhar
          )}
        >
          {/* Coluna 1: Número do Episódio */}
          <div className="text-muted-foreground text-sm text-right">
            {episode.episode_number}
          </div>

          {/* Coluna 2: Título e Descrição */}
          <div>
            <p className="font-medium line-clamp-1">{episode.title}</p>
            {episode.description && (
              <p className="text-muted-foreground text-sm line-clamp-1">
                {episode.description}
              </p>
            )}
          </div>

          {/* Coluna 3: Botão de Play */}
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => handlePlay(episode)}
            >
              <Play className="h-5 w-5" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
