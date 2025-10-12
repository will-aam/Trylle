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
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import { Episode, Category, Subcategory, Program, Tag } from "@/src/lib/types";
import { ConfirmationDialog } from "@/src/components/ui/confirmation-dialog";
import { JsonViewDialog } from "./JsonViewDialog";
import {
  EditEpisodeDialog,
  UpdateEpisodeInput,
} from "./edit/edit-episode-dialog";

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
}: EpisodeActionsProps) {
  const [isJsonDialogOpen, setIsJsonDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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

      <EditEpisodeDialog
        episode={episode}
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
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
        title="Visualização do JSON do Episódio"
      />
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={() => onDelete(episode)}
        title="Confirmar Exclusão"
        description={`Deseja realmente excluir o episódio "${episode.title}"?`}
      />
    </>
  );
}
