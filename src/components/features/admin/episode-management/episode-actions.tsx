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
import { Episode, Category, Subcategory, Program, Tag } from "@/src/lib/types"; // Adicionado mais tipos
import { deleteEpisodeAction } from "@/src/app/admin/episodes/actions"; // <- CORREÇÃO: Nome da função
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
}

export function EpisodeActions({
  episode,
  categories,
  subcategories,
  programs,
  allTags,
}: EpisodeActionsProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isJsonDialogOpen, setIsJsonDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);

  const handleDelete = async () => {
    const result = await deleteEpisodeAction(episode.id); // <- CORREÇÃO: Nome da função
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

      {/* DIÁLOGOS CORRIGIDOS */}
      <EditEpisodeDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        episode={episode}
        categories={categories} // <- CORREÇÃO: Prop passada
        subcategories={subcategories} // <- CORREÇÃO: Prop passada
        programs={programs} // <- CORREÇÃO: Prop passada
        allTags={allTags} // <- CORREÇÃO: Prop passada
        onUpdate={function (
          episodeId: string,
          updates: Partial<UpdateEpisodeInput>
        ): Promise<boolean> {
          throw new Error("Function not implemented.");
        }}
      />
      <JsonViewDialog
        isOpen={isJsonDialogOpen}
        onOpenChange={setIsJsonDialogOpen}
        data={episode} // <- CORREÇÃO: Nome da prop
        title={""}
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
