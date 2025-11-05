// src/components/features/admin/episode-management/episode-table.tsx
"use client";

import React, { useState, useEffect } from "react";
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
import type { UpdateEpisodeInput } from "./edit/edit-episode.schema";
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

// Hook para detectar se estamos em mobile
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Verificação inicial
    checkIfMobile();

    // Adicionar listener para mudanças de tamanho
    window.addEventListener("resize", checkIfMobile);

    // Limpar listener
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  return isMobile;
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
  const isMobile = useIsMobile();

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

  // Versão mobile simplificada
  if (isMobile) {
    return (
      <div className="space-y-2">
        <div className="w-full">
          {episodes.map((ep) => {
            const updating = isUpdating[ep.id] ?? false;

            return (
              <div
                key={ep.id}
                className={cn(
                  "flex items-center justify-between p-4 border-b",
                  updating && "opacity-50"
                )}
              >
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      Ep. {ep.episode_number}
                    </span>
                    <h3 className="font-medium text-sm">{ep.title}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {ep.programs?.title || "—"}
                  </p>
                </div>
                <div
                  className={cn(
                    "p-2 cursor-pointer rounded-full bg-primary/10 hover:bg-primary/20 transition-colors",
                    updating && "pointer-events-none opacity-50"
                  )}
                  onClick={() => player.setEpisode(ep)}
                >
                  <Play className="h-5 w-5 text-primary" />
                </div>
              </div>
            );
          })}
          {episodes.length === 0 && (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Nenhum episódio para exibir.
            </div>
          )}
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
            data={viewingJsonEpisode}
            title={`JSON do Episódio: ${viewingJsonEpisode.title}`}
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

  // Versão desktop (mantida original)
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
                className="cursor-pointer w-[80px]"
                onClick={() => onSort("episode_number")}
              >
                Episódio
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
                  <TableCell className="font-medium w-[80px]">
                    <div className="flex items-center">
                      {updating && (
                        <Loader2
                          className="mr-2 h-4 w-4 animate-spin text-muted-foreground"
                          aria-label="Atualizando status..."
                        />
                      )}
                      Ep. {ep.episode_number}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium w-[250px] max-w-[250px]">
                    <div className="truncate" title={ep.title}>
                      {ep.title}
                    </div>
                  </TableCell>

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
                  colSpan={7}
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
          data={viewingJsonEpisode}
          title={`JSON do Episódio: ${viewingJsonEpisode.title}`}
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
