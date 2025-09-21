"use client";

import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent } from "@/src/components/ui/card";
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

interface EpisodeTableProps {
  episodes: Episode[];
  setEpisodes: (episodes: Episode[]) => void;
  onEpisodeUpdate: () => void;
  onSort: (column: keyof Episode) => void;
  sortColumn: keyof Episode | "";
  sortDirection: SortDirection;
  selectedEpisodes: string[];
  onSelectEpisode: (episodeId: string) => void;
  onSelectAll: (isSelected: boolean) => void;
}

export function EpisodeTable({
  episodes,
  setEpisodes,
  onEpisodeUpdate,
  onSort,
  sortColumn,
  sortDirection,
  selectedEpisodes,
  onSelectEpisode,
  onSelectAll,
}: EpisodeTableProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const renderSortIcon = (column: keyof Episode) => {
    if (sortColumn !== column) {
      return <ChevronsUpDown className="h-4 w-4" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="h-4 w-4 text-primary" />
    ) : (
      <ArrowDown className="h-4 w-4 text-primary" />
    );
  };

  const getStatusBadge = (status: Episode["status"]) => {
    switch (status) {
      case "published":
        return (
          <Badge variant="default" className="bg-green-600 hover:bg-green-700">
            Publicado
          </Badge>
        );
      case "draft":
        return <Badge variant="secondary">Rascunho</Badge>;
      case "scheduled":
        return (
          <Badge
            variant="default"
            className="bg-yellow-500 hover:bg-yellow-600 text-black"
          >
            Agendado
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      selectedEpisodes.length === episodes.length &&
                      episodes.length > 0
                    }
                    onCheckedChange={(checked) => onSelectAll(!!checked)}
                    aria-label="Selecionar todos"
                  />
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="min-w-[250px]">
                  <Button
                    variant="ghost"
                    onClick={() => onSort("title")}
                    className="px-0 hover:bg-transparent"
                  >
                    Título
                    {renderSortIcon("title")}
                  </Button>
                </TableHead>
                <TableHead className="hidden md:table-cell">Duração</TableHead>
                <TableHead className="hidden md:table-cell">
                  Categoria
                </TableHead>
                <TableHead className="hidden xl:table-cell">
                  <Button
                    variant="ghost"
                    onClick={() => onSort("published_at")}
                    className="px-0 hover:bg-transparent"
                  >
                    Data
                    {renderSortIcon("published_at")}
                  </Button>
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  <Button
                    variant="ghost"
                    onClick={() => onSort("view_count")}
                    className="px-0 hover:bg-transparent"
                  >
                    Visualizações
                    {renderSortIcon("view_count")}
                  </Button>
                </TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {episodes.map((episode) => (
                <TableRow
                  key={episode.id}
                  data-state={
                    selectedEpisodes.includes(episode.id) && "selected"
                  }
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedEpisodes.includes(episode.id)}
                      onCheckedChange={() => onSelectEpisode(episode.id)}
                      aria-label={`Selecionar episódio ${episode.title}`}
                    />
                  </TableCell>
                  <TableCell>{getStatusBadge(episode.status)}</TableCell>
                  <TableCell>
                    <div className="font-medium truncate max-w-xs">
                      {episode.title}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {episode.duration_in_seconds
                      ? formatTime(episode.duration_in_seconds)
                      : "--:--"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {episode.categories?.name || "N/A"}
                  </TableCell>
                  <TableCell className="hidden xl:table-cell">
                    {formatDate(episode.published_at)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {episode.view_count}
                  </TableCell>
                  <TableCell>
                    <EpisodeActions
                      episode={episode}
                      onEpisodeUpdate={onEpisodeUpdate}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
