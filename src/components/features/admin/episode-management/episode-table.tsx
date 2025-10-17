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
import { Loader2, Pencil, SquarePen } from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { FilePenLine } from "lucide-react";
import { EditEpisodeDialog } from "./edit/edit-episode-dialog";

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

  // Estados para controlar a edição inline do título (usado apenas no desktop)
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [editingEpisodeId, setEditingEpisodeId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>("");
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);

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

  // Funções para manipular a edição inline (usado apenas no desktop)
  const handleStartEditing = (episode: Episode) => {
    setEditingEpisodeId(episode.id);
    setEditingTitle(episode.title);
  };

  const handleCancelEditing = () => {
    setEditingEpisodeId(null);
    setEditingTitle("");
  };

  const handleSaveTitle = async () => {
    if (!editingEpisodeId) return;

    const originalEpisode = episodes.find((ep) => ep.id === editingEpisodeId);

    if (
      originalEpisode &&
      editingTitle.trim() &&
      originalEpisode.title !== editingTitle.trim()
    ) {
      await onUpdateEpisode(editingEpisodeId, { title: editingTitle.trim() });
    }

    handleCancelEditing();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSaveTitle();
    } else if (event.key === "Escape") {
      handleCancelEditing();
    }
  };

  return (
    <div className="space-y-3">
      {/* Tabela - somente em md+ (mantém seleção por checkbox e edição inline) */}
      <div className="hidden md:block overflow-x-auto">
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
                className="cursor-pointer max-w-xs"
                onClick={() => onSort("title")}
              >
                Título
                {sortColumn === "title" && (
                  <span className="ml-1 text-xs text-muted-foreground">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </TableHead>
              <TableHead>Programa</TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => onSort("status")}
              >
                Status
                {sortColumn === "status" && (
                  <span className="ml-1 text-xs text-muted-foreground">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => onSort("published_at")}
              >
                Data de publicação
                {sortColumn === "published_at" && (
                  <span className="ml-1 text-xs text-muted-foreground">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {episodes.map((ep) => {
              const isSelected = selectedEpisodes.includes(ep.id);
              const updating = isUpdating[ep.id] ?? false;
              const isEditing = editingEpisodeId === ep.id;

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
                  <TableCell
                    className="font-medium py-2 max-w-xs"
                    onMouseEnter={() => setHoveredRow(ep.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    {isEditing ? (
                      <Input
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onBlur={handleSaveTitle}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        className="h-8"
                      />
                    ) : (
                      <div className="relative pr-8 group/item">
                        <span className="block truncate">{ep.title}</span>
                        {hoveredRow === ep.id && !updating && (
                          <button
                            onClick={() => handleStartEditing(ep)}
                            className="absolute top-1/2 -translate-y-1/2 right-0 p-1 text-muted-foreground hover:text-foreground bg-background/90 backdrop-blur-sm rounded-sm shadow-sm"
                          >
                            <Pencil size={16} />
                          </button>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {ep.programs?.title || "—"}
                  </TableCell>
                  <TableCell>
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
                  <TableCell>{formatDate(ep.published_at)}</TableCell>
                  <TableCell className="py-2">
                    <div className="flex items-center justify-end gap-1">
                      {/* Ícone de Edição Principal */}
                      <Button
                        variant="ghost"
                        className={cn(
                          "h-8 w-8 p-0",
                          updating && "pointer-events-none opacity-50"
                        )}
                        aria-label="Editar episódio"
                        disabled={updating}
                        onClick={() => setEditingEpisode(ep)}
                      >
                        <SquarePen className="h-4 w-4" />
                      </Button>

                      {/* Menu de Ações Secundárias */}
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
                  colSpan={6}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  Nenhum episódio para exibir.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Lista/Card - somente em mobile (SEM edição inline no título) */}
      <div className="md:hidden space-y-2">
        {episodes.map((ep) => {
          const updating = isUpdating[ep.id] ?? false;

          return (
            <div
              key={ep.id}
              className={cn("rounded-md border bg-background p-3 shadow-sm")}
            >
              {/* Linha superior: título + ações (sem checkbox) */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  {/* ALTERAÇÃO: Removida toda a lógica de edição inline do título no mobile */}
                  <div className="truncate font-medium">{ep.title}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {ep.programs?.title || "—"} • {formatDate(ep.published_at)}
                  </div>
                </div>

                <div
                  className={cn(
                    "flex-shrink-0",
                    updating && "pointer-events-none opacity-50"
                  )}
                  aria-busy={updating}
                >
                  <EpisodeActions episode={ep} {...getActionsProps(ep)} />
                </div>
              </div>

              {/* Linha inferior: status + loading */}
              <div className="mt-3 flex items-center justify-between">
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
              </div>
            </div>
          );
        })}
        {episodes.length === 0 && (
          <div className="py-8 text-center text-sm text-muted-foreground">
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

      {/* Modal de Edição de Episódio */}
      {editingEpisode && (
        <EditEpisodeDialog
          key={editingEpisode.id}
          episode={editingEpisode}
          isOpen={!!editingEpisode}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setEditingEpisode(null);
            }
          }}
          onUpdate={onUpdateEpisode}
          categories={categories}
          subcategories={subcategories}
          programs={programs}
          allTags={allTags}
        />
      )}
    </div>
  );
}
