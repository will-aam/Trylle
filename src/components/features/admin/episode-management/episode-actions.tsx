"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Button } from "@/src/components/ui/button";
import { MoreHorizontal, Edit, Archive, Play, Trash2 } from "lucide-react";
import { useState } from "react";
import { usePlayer } from "@/src/hooks/use-player";
import { useToast } from "@/src/hooks/use-toast";
import { Episode } from "@/src/lib/types";
import { EditEpisodeDialog } from "../edit-episode-dialog";

interface EpisodeActionsProps {
  episode: Episode;
  onEpisodeUpdate: () => void;
}

export function EpisodeActions({
  episode,
  onEpisodeUpdate,
}: EpisodeActionsProps) {
  const { setEpisode } = usePlayer();
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handlePlay = () => {
    setEpisode(episode);
    toast({
      title: "Playback started",
      description: episode.title,
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handlePlay}>
            <Play className="mr-2 h-4 w-4" />
            Tocar Episódio
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setIsEditDialogOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Archive className="mr-2 h-4 w-4" />
            Arquivar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <EditEpisodeDialog
        episode={episode}
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onEpisodeUpdate={onEpisodeUpdate}
      />
    </>
  );
}
