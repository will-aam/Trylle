// src/components/features/admin/episode-management/episode-table.tsx
"use client";

import { EpisodeActions } from "./episode-actions";
import { Episode, SortDirection } from "@/src/lib/types";
import { formatTime } from "@/src/lib/utils";
import { ChevronsUpDown, ArrowDown, ArrowUp } from "lucide-react";
import { Button } from "@/src/components/ui/button";
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

interface EpisodeTableProps {
  episodes: Episode[];
  onEdit: (episode: Episode) => void;
  onDelete: (episode: Episode) => void;
  onSort: (column: keyof Episode | "") => void;
  sortColumn: keyof Episode | "";
  sortDirection: SortDirection;
  selectedEpisodes: string[];
  onSelectEpisode: (episodeId: string) => void;
  onSelectAll: (isSelected: boolean) => void;
  onStatusChange?: (episodeId: string, newStatus: Episode["status"]) => void;
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
}: EpisodeTableProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const renderSortIcon = (column: keyof Episode | "") => {
    if (sortColumn !== column)
      return <ChevronsUpDown className="h-4 w-4 ml-2" />;
    return sortDirection === "asc" ? (
      <ArrowUp className="h-4 w-4 ml-2 text-primary" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-2 text-primary" />
    );
  };

  const handleStatusChange = (
    episodeId: string,
    newStatus: Episode["status"]
  ) => {
    if (onStatusChange) {
      onStatusChange(episodeId, newStatus);
    }
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={
                  episodes.length > 0 &&
                  selectedEpisodes.length === episodes.length
                }
                onCheckedChange={(checked) => onSelectAll(!!checked)}
              />
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => onSort("title")}>
                Título {renderSortIcon("title")}
              </Button>
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Programa</TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => onSort("published_at")}>
                Data {renderSortIcon("published_at")}
              </Button>
            </TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {episodes.map((episode) => (
            <TableRow key={episode.id}>
              <TableCell>
                <Checkbox
                  checked={selectedEpisodes.includes(episode.id)}
                  onCheckedChange={() => onSelectEpisode(episode.id)}
                />
              </TableCell>
              <TableCell>
                <div className="font-medium">{episode.title}</div>
              </TableCell>
              <TableCell>
                <StatusBadgeSelector
                  status={episode.status}
                  onStatusChange={(newStatus) =>
                    handleStatusChange(episode.id, newStatus)
                  }
                  disabled={!onStatusChange}
                />
              </TableCell>
              <TableCell>
                {episode.programs?.title ?? (
                  <span className="text-muted-foreground">N/A</span>
                )}
              </TableCell>
              <TableCell>{formatDate(episode.published_at)}</TableCell>
              <TableCell>
                <EpisodeActions
                  episode={episode}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
