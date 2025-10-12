// src/components/features/admin/episode-management/episode-actions.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Button } from "@/src/components/ui/button";
import { MoreHorizontal, CalendarClock, Edit, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import { Episode, Category, Subcategory, Program, Tag } from "@/src/lib/types";
import { deleteEpisodeAction } from "@/src/app/admin/episodes/actions"; // Fallback enquanto não conectamos o Manager
import { ConfirmationDialog } from "@/src/components/ui/confirmation-dialog";
import { JsonViewDialog } from "./JsonViewDialog";
import {
  EditEpisodeDialog,
  UpdateEpisodeInput,
} from "./edit/edit-episode-dialog";
import { ScheduleEpisodeDialog } from "./schedule-episode-dialog";

// Props expandidas para incluir dados necessários pelos diálogos filhos
export interface EpisodeActionsProps {
  episode: Episode;
  categories: Category[];
  subcategories: Subcategory[];
  programs: Program[];
  allTags: Tag[];
  // Novos callbacks opcionais para integração com Optimistic UI (fornecidos pelo EpisodeManager)
  onDelete?: (episode: Episode) => Promise<void>;
  onUpdate?: (
    episodeId: string,
    updates: Partial<UpdateEpisodeInput>
  ) => Promise<boolean>;
}

export function EpisodeActions({
  episode,
  categories,
  subcategories,
  programs,
  allTags,
  onDelete,
  onUpdate,
}: EpisodeActionsProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isJsonDialogOpen, setIsJsonDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);

  const handleDelete = async () => {
    // Se vier callback do Manager, usamos ele (permite UI otimista)
    if (onDelete) {
      try {
        await onDelete(episode);
        setIsDeleteDialogOpen(false);
      } catch (error: any) {
        toast.error(error?.message || "Erro ao excluir o episódio.");
      }
      return;
    }

    // Fallback: comportamento atual (server action direta + refresh)
    const result = await deleteEpisodeAction(episode.id);
    if (result.success) {
      toast.success(result.success);
      setIsDeleteDialogOpen(false);
      router.refresh();
    } else {
      toast.error(result.error);
    }
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
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          {episode.status === "draft" && (
            <DropdownMenuItem onClick={() => setIsScheduleDialogOpen(true)}>
              <CalendarClock className="mr-2 h-4 w-4" />
              Agendar
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => setIsJsonDialogOpen(true)}>
            <Eye className="mr-2 h-4 w-4" />
            Ver JSON
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600 focus:text-red-600"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Deletar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Renderiza o diálogo de agendamento */}
      <ScheduleEpisodeDialog
        isOpen={isScheduleDialogOpen}
        onOpenChange={setIsScheduleDialogOpen}
        episodeId={episode.id}
        episodeTitle={episode.title}
      />

      {/* Diálogo de edição agora delega a atualização ao callback, quando existir */}
      <EditEpisodeDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        episode={episode}
        categories={categories}
        subcategories={subcategories}
        programs={programs}
        allTags={allTags}
        onUpdate={async (
          episodeId: string,
          updates: Partial<UpdateEpisodeInput>
        ): Promise<boolean> => {
          if (!onUpdate) {
            toast.error(
              "Ação de atualização não está disponível. Tente novamente mais tarde."
            );
            return false;
          }
          return await onUpdate(episodeId, updates);
        }}
      />

      <JsonViewDialog
        isOpen={isJsonDialogOpen}
        onOpenChange={setIsJsonDialogOpen}
        data={episode}
        title={`Episódio: ${episode.title}`}
      />

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Você tem certeza?"
        description={`Esta ação não pode ser desfeita. Isso irá deletar permanentemente o episódio "${episode.title}".`}
      />
    </>
  );
}
