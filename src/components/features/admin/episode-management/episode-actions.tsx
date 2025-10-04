"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Button } from "@/src/components/ui/button";
import {
  MoreHorizontal,
  Trash2,
  Edit,
  Code,
  Link as LinkIcon,
  Download,
} from "lucide-react";
import { Episode } from "@/src/lib/types";
import { JsonViewDialog } from "./JsonViewDialog"; // Vamos precisar criar este
import { toast } from "sonner";

interface EpisodeActionsProps {
  episode: Episode;
  onEdit: (episode: Episode) => void;
  onDelete: (episode: Episode) => void;
}

export function EpisodeActions({
  episode,
  onEdit,
  onDelete,
}: EpisodeActionsProps) {
  const [isJsonViewOpen, setIsJsonViewOpen] = useState(false);

  const handleCopyAudioUrl = () => {
    navigator.clipboard.writeText(episode.audio_url);
    toast.success("URL do áudio copiada para a área de transferência!");
  };

  const handleDownloadAudio = () => {
    // Cria um link temporário e simula o clique para iniciar o download
    const link = document.createElement("a");
    link.href = episode.audio_url;
    // Sugere um nome de arquivo para o navegador
    link.download = episode.file_name || "audio.mp3";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.info("Download do áudio iniciado.");
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Ações</DropdownMenuLabel>
          <DropdownMenuItem onSelect={() => onEdit(episode)}>
            <Edit className="mr-2 h-4 w-4" />
            <span>Editar</span>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleCopyAudioUrl}>
            <LinkIcon className="mr-2 h-4 w-4" />
            <span>Copiar URL do Áudio</span>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleDownloadAudio}>
            <Download className="mr-2 h-4 w-4" />
            <span>Baixar Áudio</span>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setIsJsonViewOpen(true)}>
            <Code className="mr-2 h-4 w-4" />
            <span>Ver JSON</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-500 focus:text-red-500"
            onSelect={() => onDelete(episode)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Deletar</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <JsonViewDialog
        isOpen={isJsonViewOpen}
        onOpenChange={setIsJsonViewOpen}
        data={episode}
        title="Visualizador JSON do Episódio"
      />
    </>
  );
}
