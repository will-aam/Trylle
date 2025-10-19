// src/components/features/admin/episode-management/episode-table.tsx

"use client";

import React, { useState } from "react";
import {
  Episode,
  SortDirection,
  Category,
  Subcategory,
  Program,
  Tag,
} from "@/src/lib/types";
import { Checkbox } from "@/src/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { StatusBadgeSelector } from "@/src/components/ui/status-badge-selector";
import { cn } from "@/src/lib/utils";
import type { UpdateEpisodeInput } from "./edit/edit-episode-dialog";
import { ScheduleEpisodeDialog } from "./schedule-episode-dialog";
import { Loader2 } from "lucide-react";
import { FileCode, Play, SquarePen } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { EditEpisodeDialog } from "./edit/edit-episode-dialog";
import { JsonViewDialog } from "./JsonViewDialog";
import { usePlayer } from "@/src/hooks/use-player";

export interface EpisodeTableProps {
  episodes: Episode[];
  onDelete: (episode: Episode) => Promise<boolean>;
  onSort: (column: keyof Episode | "") => void;
  sortColumn: keyof Episode | "";
  sortDirection: SortDirection;
  selectedEpisodes: string[];
  onSelectEpisode: (id: string) => void;
  onSelectAll: (select: boolean) => void;
  onStatusChange: (episodeId: string, newStatus: Episode["status"]) => void;
  isUpdating: Record<string, boolean>;
  onUpdateEpisode: (
    episodeId: string,
    updates: Partial<UpdateEpisodeInput>
  ) => Promise<boolean>;
  onScheduleEpisode: (
    episodeId: string,
    publishAtISO: string
  ) => Promise<boolean>;
  categories: Category[];
  subcategories: Subcategory[];
  programs: Program[];
  allTags: Tag[];
}

export function EpisodeTable({
  episodes,
  onDelete,
  onSort,
  sortColumn,
  sortDirection,
  selectedEpisodes,
  onSelectEpisode,
  onSelectAll,
  onStatusChange,
  isUpdating,
  onUpdateEpisode,
  onScheduleEpisode,
  categories,
  subcategories,
  programs,
  allTags,
}: EpisodeTableProps) {
  const [schedulingEpisode, setSchedulingEpisode] = useState<Episode | null>(
    null
  );
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);
  const [viewingJsonEpisode, setViewingJsonEpisode] = useState<Episode | null>(
    null
  );
  const player = usePlayer();

  const formatDate = (isoString: string | null) => {
    if (!isoString) return "—";
    return new Date(isoString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const allSelected =
    episodes.length > 0 && selectedEpisodes.length === episodes.length;

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 px-4">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(checked) => onSelectAll(!!checked)}
                  aria-label="Selecionar todos"
                />
              </TableHead>
              <TableHead
                className="cursor-pointer w-[250px] max-w-[250px]"
                onClick={() => onSort("title")}
              >
                Título
              </TableHead>
              {/* Coluna "Programa" com largura fixa */}
              <TableHead className="w-[250px] max-w-[250px]">
                Programa
              </TableHead>
              <TableHead
                className="cursor-pointer w-32"
                onClick={() => onSort("status")}
              >
                Status
              </TableHead>
              <TableHead
                className="cursor-pointer w-40"
                onClick={() => onSort("published_at")}
              >
                Data de publicação
              </TableHead>
              <TableHead className="text-right w-32">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {episodes.map((ep) => {
              const isSelected = selectedEpisodes.includes(ep.id);
              const updating = isUpdating[ep.id] ?? false;

              return (
                <TableRow
                  key={ep.id}
                  data-state={isSelected ? "selected" : ""}
                  className={cn(updating && "opacity-50")}
                >
                  <TableCell className="px-4">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onSelectEpisode(ep.id)}
                      aria-label={`Selecionar episódio ${ep.title}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium w-[250px] max-w-[250px]">
                    <div className="truncate" title={ep.title}>
                      {ep.title}
                    </div>
                  </TableCell>
                  {/* Célula para exibir o nome do programa com truncamento */}
                  <TableCell className="text-sm text-muted-foreground w-[250px] max-w-[250px]">
                    <div className="truncate" title={ep.programs?.title || "—"}>
                      {ep.programs?.title || "—"}
                    </div>
                  </TableCell>
                  <TableCell className="w-32">
                    <div className="flex items-center">
                      {updating && (
                        <Loader2
                          className="mr-2 h-4 w-4 animate-spin text-muted-foreground"
                          aria-label="Atualizando status..."
                        />
                      )}
                      <StatusBadgeSelector
                        status={ep.status}
                        disabled={updating}
                        onStatusChange={(newStatus) =>
                          onStatusChange(ep.id, newStatus)
                        }
                        onSchedule={() => setSchedulingEpisode(ep)}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="w-40">
                    {formatDate(ep.published_at)}
                  </TableCell>
                  <TableCell className="py-2 w-32">
                    <div className="flex items-center justify-end">
                      <TooltipProvider>
                        {/* Botão Ver JSON */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={cn(
                                "p-1 cursor-pointer rounded-sm hover:bg-muted/60 transition-colors",
                                updating && "pointer-events-none opacity-50"
                              )}
                              onClick={() => setViewingJsonEpisode(ep)}
                            >
                              <FileCode className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Ver JSON</p>
                          </TooltipContent>
                        </Tooltip>

                        {/* Botão Tocar Episódio */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={cn(
                                "p-1 cursor-pointer rounded-sm hover:bg-muted/60 transition-colors",
                                updating && "pointer-events-none opacity-50"
                              )}
                              onClick={() => player.setEpisode(ep)}
                            >
                              <Play className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Tocar Episódio</p>
                          </TooltipContent>
                        </Tooltip>

                        {/* Botão Editar Episódio */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={cn(
                                "p-1 cursor-pointer rounded-sm hover:bg-muted/60 transition-colors",
                                updating && "pointer-events-none opacity-50"
                              )}
                              onClick={() => setEditingEpisode(ep)}
                            >
                              <SquarePen className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Editar Episódio</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {episodes.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6} // Ajustado para 6 colunas
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  Nenhum episódio para exibir.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {schedulingEpisode && (
        <ScheduleEpisodeDialog
          isOpen={!!schedulingEpisode}
          onOpenChange={(isOpen) => {
            if (!isOpen) setSchedulingEpisode(null);
          }}
          episodeId={schedulingEpisode.id}
          episodeTitle={schedulingEpisode.title}
          defaultDateISO={schedulingEpisode.published_at ?? undefined}
          onConfirm={onScheduleEpisode}
        />
      )}

      {viewingJsonEpisode && (
        <JsonViewDialog
          data={viewingJsonEpisode} // Trocamos 'episode' por 'data'
          title={`JSON do Episódio: ${viewingJsonEpisode.title}`} // Adicionamos um título
          isOpen={!!viewingJsonEpisode}
          onOpenChange={(isOpen) => {
            if (!isOpen) setViewingJsonEpisode(null);
          }}
        />
      )}
      {editingEpisode && (
        <EditEpisodeDialog
          episode={editingEpisode}
          onUpdate={onUpdateEpisode}
          isOpen={!!editingEpisode}
          onOpenChange={(isOpen) => {
            if (!isOpen) setEditingEpisode(null);
          }}
          categories={categories}
          subcategories={subcategories}
          programs={programs}
          allTags={allTags}
        />
      )}
    </div>
  );
}
