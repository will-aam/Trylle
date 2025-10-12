// src/components/features/admin/episode-management/episode-actions.tsx

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
import { MoreHorizontal, CalendarClock, Edit, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import { Episode, Category, Subcategory, Program, Tag } from "@/src/lib/types";
import { ConfirmationDialog } from "@/src/components/ui/confirmation-dialog";
import { JsonViewDialog } from "./JsonViewDialog";
import {
  EditEpisodeDialog,
  UpdateEpisodeInput,
} from "./edit/edit-episode-dialog";
import { ScheduleEpisodeDialog } from "./schedule-episode-dialog";

export interface EpisodeActionsProps {
  episode: Episode;
  categories: Category[];
  subcategories: Subcategory[];
  programs: Program[];
  allTags: Tag[];
  onDelete: (episode: Episode) => Promise<boolean>;
  onUpdate: (
    episodeId: string,
    updates: Partial<UpdateEpisodeInput>
  ) => Promise<boolean>;
  // A correção está aqui: a prop agora espera Promise<boolean>
  onScheduleEpisode: (
    episodeId: string,
    publishAtISO: string
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
  onScheduleEpisode,
}: EpisodeActionsProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isJsonDialogOpen, setIsJsonDialogOpen] = useState(false);

  const handleDelete = async () => {
    // A função onDelete já foi fornecida pelo manager, apenas a chamamos
    await onDelete(episode);
    // O manager é responsável por toasts e UI otimista
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
          <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsScheduleDialogOpen(true)}>
            <CalendarClock className="mr-2 h-4 w-4" />
            Agendar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsJsonDialogOpen(true)}>
            <Eye className="mr-2 h-4 w-4" />
            Ver JSON
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-500"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Deletar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* --- DIÁLOGOS --- */}

      <ScheduleEpisodeDialog
        isOpen={isScheduleDialogOpen}
        onOpenChange={setIsScheduleDialogOpen}
        episodeId={episode.id}
        episodeTitle={episode.title}
        // Agora o tipo da prop está correto
        onConfirm={onScheduleEpisode}
        defaultDateISO={episode.published_at}
      />

      <EditEpisodeDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        episode={episode}
        categories={categories}
        subcategories={subcategories}
        programs={programs}
        allTags={allTags}
        onUpdate={onUpdate}
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
