// src/components/features/program/EpisodeList.tsx
"use client";

import { Episode } from "@/src/lib/types";
import { Play } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

// 1. Importação do hook descomentada e ativada
import { usePlayer } from "@/src/hooks/use-player";

interface EpisodeListProps {
  // A lista de episódios vinda do nosso getProgramWithEpisodes
  episodes: Episode[];
}

export function EpisodeList({ episodes }: EpisodeListProps) {
  // 2. Instanciamos o hook e pegamos a função 'setEpisode'
  const { setEpisode } = usePlayer();

  const handlePlay = (episode: Episode) => {
    // 3. Chamamos a função do hook para definir o episódio ativo
    //    Isso vai atualizar o estado global e "ligar" o audio-player.tsx
    setEpisode(episode);
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
      {/* HEADER DA TABELA - Visível apenas em desktop (md:) */}
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
