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
import { EpisodeActions, EpisodeActionsProps } from "./episode-actions";
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

  const getActionsProps = (
    episode: Episode
  ): Omit<EpisodeActionsProps, "episode"> => ({
    categories,
    subcategories,
    programs,
    allTags,
    onDelete,
    onUpdate: onUpdateEpisode,
    onScheduleEpisode,
  });

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
                className="cursor-pointer"
                onClick={() => onSort("title")}
              >
                Título
              </TableHead>
              {/* Coluna "Programa" Adicionada */}
              <TableHead>Programa</TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => onSort("status")}
              >
                Status
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => onSort("published_at")}
              >
                Data de publicação
              </TableHead>
              <TableHead className="text-right">Ações</TableHead>
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
                  <TableCell className="font-medium">{ep.title}</TableCell>
                  {/* Célula para exibir o nome do programa */}
                  <TableCell className="text-sm text-muted-foreground">
                    {ep.programs?.title || "—"}
                  </TableCell>
                  <TableCell>
                    <StatusBadgeSelector
                      status={ep.status}
                      disabled={updating}
                      onStatusChange={(newStatus) =>
                        onStatusChange(ep.id, newStatus)
                      }
                      onSchedule={() => setSchedulingEpisode(ep)}
                    />
                  </TableCell>
                  <TableCell>{formatDate(ep.published_at)}</TableCell>
                  <TableCell className="py-2">
                    <div className="flex justify-end">
                      <div
                        className={cn(
                          updating && "pointer-events-none opacity-50"
                        )}
                        aria-busy={updating}
                      >
                        <EpisodeActions episode={ep} {...getActionsProps(ep)} />
                      </div>
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
    </div>
  );
}