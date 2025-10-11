// src/components/features/admin/episode-management/episode-table.tsx

"use client";

import React, { useState } from "react"; // <- Importa o useState
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
import { Button } from "@/src/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { StatusBadgeSelector } from "@/src/components/ui/status-badge-selector";
import { ChevronsUpDown, ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { ScheduleEpisodeDialog } from "./schedule-episode-dialog"; // <- Importa o Dialog

// Interface de props expandida para os dados de edição
export interface EpisodeTableProps {
  episodes: Episode[];
  onEdit: (episode: Episode) => void;
  onDelete: (episode: Episode) => void;
  onSort: (column: keyof Episode | "") => void;
  sortColumn: keyof Episode | "";
  sortDirection: SortDirection;
  selectedEpisodes: string[];
  onSelectEpisode: (episodeId: string) => void;
  onSelectAll: (selectAll: boolean) => void;
  onStatusChange?: (episodeId: string, newStatus: Episode["status"]) => void;
  responsiveMode?: "auto" | "table";
  minTableWidthClass?: string;
  hideProgramColumn?: boolean;
  hideDateColumn?: boolean;
  actionsMode?: "menu" | "primary+menu" | "inline-hover" | "auto";
  primaryAction?: "edit" | "viewJson" | "none";
  compactRows?: boolean;
  // Props para o diálogo de edição
  categories: Category[];
  subcategories: Subcategory[];
  programs: Program[];
  allTags: Tag[];
}

export function EpisodeTable({
  episodes,
  onEdit,
  onDelete,
  onSort,
  sortColumn,
  sortDirection,
  selectedEpisodes,
  onSelectEpisode,
  onSelectAll,
  onStatusChange,
  responsiveMode = "auto",
  minTableWidthClass = "min-w-[900px]",
  hideProgramColumn = false,
  hideDateColumn = false,
  actionsMode = "auto",
  primaryAction = "edit",
  compactRows = true,
  // Props para o diálogo de edição
  categories,
  subcategories,
  programs,
  allTags,
}: EpisodeTableProps) {
  // Estado para controlar o diálogo de agendamento
  const [episodeToSchedule, setEpisodeToSchedule] = useState<Episode | null>(
    null
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleStatusChange = (
    episodeId: string,
    newStatus: Episode["status"]
  ) => {
    if (onStatusChange) onStatusChange(episodeId, newStatus);
  };

  const renderSortableHead = (
    label: string,
    column: keyof Episode,
    extraClass?: string
  ) => {
    const isActive = sortColumn === column;
    const icon = !isActive ? (
      <ChevronsUpDown className="h-4 w-4 ml-1 opacity-60" />
    ) : sortDirection === "asc" ? (
      <ArrowUp className="h-4 w-4 ml-1 text-primary" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-1 text-primary" />
    );
    let ariaSort: React.AriaAttributes["aria-sort"] = "none";
    if (isActive)
      ariaSort = sortDirection === "asc" ? "ascending" : "descending";

    return (
      <TableHead
        scope="col"
        aria-sort={ariaSort}
        className={cn("whitespace-nowrap", extraClass)}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSort(column)}
          className="h-auto p-0 font-medium flex items-center"
          aria-label={`Ordenar por ${label}`}
        >
          {label}
          {icon}
        </Button>
      </TableHead>
    );
  };

  // Prepara as props para o EpisodeActions para não repetir
  const getActionsProps = (episode: Episode): EpisodeActionsProps => ({
    episode,
    categories,
    subcategories,
    programs,
    allTags,
  });

  return (
    <>
      {/* =======================
       MOBILE CARDS (responsiveMode = auto)
       ======================= */}
      {responsiveMode === "auto" && (
        <div className="w-full md:hidden">
          <div className="space-y-4">
            {episodes.map((ep) => {
              const selected = selectedEpisodes.includes(ep.id);
              return (
                <div
                  key={ep.id}
                  className={cn(
                    "group/row rounded-md border bg-background p-4 shadow-sm transition",
                    selected && "ring-1 ring-primary/40"
                  )}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-start gap-2">
                      <Checkbox
                        checked={selected}
                        onCheckedChange={() => onSelectEpisode(ep.id)}
                        aria-label={`Selecionar episódio ${ep.title}`}
                      />
                      <div className="flex flex-col">
                        <span className="font-semibold leading-snug">
                          {ep.title}
                        </span>
                        {!hideProgramColumn && (
                          <span className="text-xs text-muted-foreground line-clamp-2">
                            {ep.programs?.title || "Sem programa"}
                          </span>
                        )}
                      </div>
                    </div>
                    <EpisodeActions {...getActionsProps(ep)} />
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <StatusBadgeSelector
                      status={ep.status}
                      disabled={!onStatusChange}
                      onStatusChange={(s) => handleStatusChange(ep.id, s)}
                      onSchedule={() => setEpisodeToSchedule(ep)} // <- CONECTADO AQUI
                    />
                    {!hideDateColumn && (
                      <span className="text-muted-foreground">
                        {formatDate(ep.published_at)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===========================
       Desktop Table component
       =========================== */}
      <div
        className={cn(
          responsiveMode === "auto" && "hidden md:block",
          "rounded-lg border bg-background overflow-hidden"
        )}
      >
        <div className="overflow-x-auto">
          <Table className={cn(minTableWidthClass)}>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={
                      episodes.length > 0 &&
                      selectedEpisodes.length === episodes.length
                    }
                    onCheckedChange={(checked) => onSelectAll(!!checked)}
                    aria-label="Selecionar todos"
                  />
                </TableHead>
                {renderSortableHead("Título", "title")}
                <TableHead>Status</TableHead>
                {!hideProgramColumn && <TableHead>Programa</TableHead>}
                {!hideDateColumn && renderSortableHead("Data", "published_at")}
                <TableHead className="text-right pr-5 w-[140px]">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {episodes.map((ep) => {
                const selected = selectedEpisodes.includes(ep.id);
                return (
                  <TableRow
                    key={ep.id}
                    className={cn(
                      "group/row transition-colors",
                      selected && "bg-muted/10"
                    )}
                  >
                    <TableCell className={compactRows ? "py-2" : "py-3"}>
                      <Checkbox
                        checked={selected}
                        onCheckedChange={() => onSelectEpisode(ep.id)}
                        aria-label={`Selecionar ${ep.title}`}
                      />
                    </TableCell>
                    <TableCell className={compactRows ? "py-2" : "py-3"}>
                      <div className="font-medium leading-snug line-clamp-2 max-w-[420px]">
                        {ep.title}
                      </div>
                    </TableCell>
                    <TableCell className={compactRows ? "py-2" : "py-3"}>
                      <StatusBadgeSelector
                        status={ep.status}
                        onStatusChange={(s) => handleStatusChange(ep.id, s)}
                        disabled={!onStatusChange}
                        onSchedule={() => setEpisodeToSchedule(ep)} // <- CONECTADO AQUI TAMBÉM
                      />
                    </TableCell>
                    {!hideProgramColumn && (
                      <TableCell
                        className={cn(
                          compactRows ? "py-2" : "py-3",
                          "text-sm text-muted-foreground max-w-[320px]"
                        )}
                      >
                        {ep.programs?.title ? (
                          <span className="line-clamp-2">
                            {ep.programs.title}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                    )}
                    {!hideDateColumn && (
                      <TableCell
                        className={cn(
                          compactRows ? "py-2" : "py-3",
                          "whitespace-nowrap"
                        )}
                      >
                        {formatDate(ep.published_at)}
                      </TableCell>
                    )}
                    <TableCell className={cn(compactRows ? "py-2" : "py-3")}>
                      <div className="flex justify-end">
                        <EpisodeActions {...getActionsProps(ep)} />
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
      </div>

      {/* Renderiza o diálogo de agendamento aqui */}
      {episodeToSchedule && (
        <ScheduleEpisodeDialog
          isOpen={!!episodeToSchedule}
          onOpenChange={() => setEpisodeToSchedule(null)}
          episodeId={episodeToSchedule.id}
          episodeTitle={episodeToSchedule.title}
        />
      )}
    </>
  );
}
