"use client";

import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent } from "@/src/components/ui/card";
// import { Checkbox } from "@/src/components/ui/checkbox";
import { EpisodeActions } from "./episode-actions";
import { Episode, SortDirection } from "@/src/lib/types";
import { formatTime } from "@/src/lib/utils";
import { ChevronsUpDown, ArrowDown, ArrowUp } from "lucide-react";
import { Button } from "@/src/components/ui/button";

interface EpisodeTableProps {
  episodes: Episode[];
  setEpisodes: (episodes: Episode[]) => void;
  onEpisodeUpdate: () => void;
  onSort: (column: keyof Episode) => void;
  sortColumn: keyof Episode | "";
  sortDirection: SortDirection;
}

export function EpisodeTable({
  episodes,
  setEpisodes,
  onEpisodeUpdate,
  onSort,
  sortColumn,
  sortDirection,
}: EpisodeTableProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
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
        return (
          <Badge
            variant="secondary"
            className="bg-yellow-500 hover:bg-yellow-600 text-black"
          >
            Rascunho
          </Badge>
        );
      case "scheduled":
        return (
          <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">
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
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="p-4 w-12"></th>
                <th className="text-left p-4 font-medium text-muted-foreground">
                  Status
                </th>
                <th className="text-left p-4 font-medium text-muted-foreground">
                  Título
                </th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">
                  Duração
                </th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">
                  Categoria
                </th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden xl:table-cell">
                  <Button
                    variant="ghost"
                    onClick={() => onSort("published_at")}
                    className={`px-0 hover:bg-transparent ${
                      sortColumn === "published_at" ? "text-primary" : ""
                    }`}
                  >
                    Data
                    <span className="ml-2">
                      {renderSortIcon("published_at")}
                    </span>
                  </Button>
                </th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">
                  <Button
                    variant="ghost"
                    onClick={() => onSort("view_count")}
                    className={`px-0 hover:bg-transparent ${
                      sortColumn === "view_count" ? "text-primary" : ""
                    }`}
                  >
                    Visualizações
                    <span className="ml-2">{renderSortIcon("view_count")}</span>
                  </Button>
                </th>
                <th className="text-left p-4 font-medium text-muted-foreground">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {episodes.map((episode) => (
                <tr
                  key={episode.id}
                  className="border-b border-border hover:bg-muted/50"
                >
                  <td className="p-4"></td>
                  <td className="p-4">{getStatusBadge(episode.status)}</td>
                  <td className="p-4">
                    <div className="font-medium truncate max-w-xs">
                      {episode.title}
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    {episode.duration_in_seconds
                      ? formatTime(episode.duration_in_seconds)
                      : "--:--"}
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    {episode.categories?.name || "N/A"}
                  </td>
                  <td className="p-4 text-sm hidden xl:table-cell">
                    {formatDate(episode.published_at)}
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    {episode.view_count}
                  </td>
                  <td className="p-4">
                    <EpisodeActions
                      episode={episode}
                      onEpisodeUpdate={onEpisodeUpdate}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
