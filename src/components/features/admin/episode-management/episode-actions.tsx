"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/src/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/src/components/ui/alert-dialog";
import { Button } from "@/src/components/ui/button";
import {
  MoreHorizontal,
  Edit,
  Archive,
  Play,
  Trash2,
  Send,
  Clock,
  Download,
  FileText,
} from "lucide-react";
import { useState } from "react";
import { usePlayer } from "@/src/hooks/use-player";
import { useToast } from "@/src/hooks/use-toast";
import { Episode, EpisodeDocument } from "@/src/lib/types";
import { EditEpisodeDialog } from "./edit-episode-dialog";
import { createClient } from "@/src/lib/supabase-client";

interface EpisodeActionsProps {
  episode: Episode;
  onEpisodeUpdate: () => void;
}

export function EpisodeActions({
  episode,
  onEpisodeUpdate,
}: EpisodeActionsProps) {
  const supabase = createClient();
  const { setEpisode } = usePlayer();
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [documents, setDocuments] = useState<EpisodeDocument[]>([]);
  const [documentsFetched, setDocumentsFetched] = useState(false);

  const fetchDocuments = async () => {
    if (documentsFetched) return;

    try {
      const { data, error } = await supabase
        .from("episode_documents")
        .select("*")
        .eq("episode_id", episode.id);

      if (error) {
        throw error;
      }
      setDocuments(data || []);
      setDocumentsFetched(true);
    } catch (error: any) {
      toast({
        title: "Error fetching documents",
        description: error.message || "Could not fetch episode documents.",
        variant: "destructive",
      });
    }
  };

  const handlePlay = () => {
    setEpisode(episode);
    toast({
      title: "Playback started",
      description: episode.title,
    });
  };

  const handleAudioDownload = () => {
    const link = document.createElement("a");
    link.href = episode.audio_url;
    link.download = episode.title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async () => {
    try {
      // 1. Extrair o caminho do arquivo de áudio da URL
      const audioUrl = new URL(episode.audio_url);
      const audioKey = audioUrl.pathname.slice(1); // Remove a barra inicial

      // 2. Chamar a API para deletar o arquivo de áudio principal do R2
      const audioDeleteResponse = await fetch("/api/delete-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileKey: audioKey }),
      });

      if (!audioDeleteResponse.ok) {
        console.warn(`Failed to delete audio file: ${audioKey}`);
      }

      // 3. CORREÇÃO FINAL: Buscar na tabela correta "episode_documents"
      const { data: documents } = await supabase
        .from("episode_documents")
        .select("storage_path")
        .eq("episode_id", episode.id);

      if (documents) {
        for (const doc of documents) {
          // Garante que o doc e o storage_path existem
          if (doc && doc.storage_path) {
            const docDeleteResponse = await fetch("/api/delete-file", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ fileKey: doc.storage_path }),
            });
            if (!docDeleteResponse.ok) {
              console.warn(`Failed to delete document: ${doc.storage_path}`);
            }
          }
        }
      }

      // 4. Deletar o registro do episódio no Supabase
      const { error: deleteError } = await supabase
        .from("episodes")
        .delete()
        .eq("id", episode.id);

      if (deleteError) {
        throw deleteError;
      }

      toast({
        title: "Episode deleted",
        description: "The episode and all its files have been removed.",
      });

      onEpisodeUpdate();
    } catch (error: any) {
      toast({
        title: "Error deleting",
        description:
          error.message ||
          "Could not delete the episode. Check the console for more details.",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (
    status: "draft" | "scheduled" | "published"
  ) => {
    const { error } = await supabase
      .from("episodes")
      .update({ status: status })
      .eq("id", episode.id);

    if (error) {
      toast({
        title: `Error updating status`,
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Episode status updated",
        description: `The episode is now ${status}.`,
      });
      onEpisodeUpdate();
    }
  };

  return (
    <>
      <AlertDialog>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handlePlay}>
              <Play className="mr-2 h-4 w-4" />
              Play Episode
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setIsEditDialogOpen(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>

            <DropdownMenuItem onClick={handleAudioDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download Audio
            </DropdownMenuItem>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger onMouseEnter={fetchDocuments}>
                <FileText className="mr-2 h-4 w-4" />
                Download Document
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {documents.length > 0 ? (
                  documents.map((doc) => (
                    <DropdownMenuItem
                      key={doc.id}
                      onClick={() => window.open(doc.public_url, "_blank")}
                    >
                      {doc.file_name}
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled>No documents</DropdownMenuItem>
                )}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            {episode.status === "draft" && (
              <>
                <DropdownMenuItem
                  onClick={() => handleStatusChange("published")}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Publicar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleStatusChange("scheduled")}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Agendar
                </DropdownMenuItem>
              </>
            )}

            {episode.status === "published" && (
              <DropdownMenuItem onClick={() => handleStatusChange("draft")}>
                <Archive className="mr-2 h-4 w-4" />
                Converter para rascunho
              </DropdownMenuItem>
            )}

            {episode.status === "scheduled" && (
              <>
                <DropdownMenuItem
                  onClick={() => handleStatusChange("published")}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Publicar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange("draft")}>
                  <Clock className="mr-2 h-4 w-4" />
                  Cancelar agendamento
                </DropdownMenuItem>
              </>
            )}

            <DropdownMenuSeparator />
            <AlertDialogTrigger asChild>
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Deletar
              </DropdownMenuItem>
            </AlertDialogTrigger>
          </DropdownMenuContent>
        </DropdownMenu>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o
              episódio e todos os seus arquivos de áudio e documentos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <EditEpisodeDialog
        episode={episode}
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onEpisodeUpdate={onEpisodeUpdate}
      />
    </>
  );
}
