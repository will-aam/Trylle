"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
} from "lucide-react";
import { useState } from "react";
import { usePlayer } from "@/src/hooks/use-player";
import { useToast } from "@/src/hooks/use-toast";
import { Episode } from "@/src/lib/types";
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

  const handlePlay = () => {
    setEpisode(episode);
    toast({
      title: "Playback started",
      description: episode.title,
    });
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

            {episode.status === "draft" && (
              <>
                <DropdownMenuItem
                  onClick={() => handleStatusChange("published")}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Publish
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleStatusChange("scheduled")}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Schedule
                </DropdownMenuItem>
              </>
            )}

            {episode.status === "published" && (
              <DropdownMenuItem onClick={() => handleStatusChange("draft")}>
                <Archive className="mr-2 h-4 w-4" />
                Convert to Draft
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
                  Cancel Schedule
                </DropdownMenuItem>
              </>
            )}

            <DropdownMenuSeparator />
            <AlertDialogTrigger asChild>
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </AlertDialogTrigger>
          </DropdownMenuContent>
        </DropdownMenu>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              episode and all its audio and document files.
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
