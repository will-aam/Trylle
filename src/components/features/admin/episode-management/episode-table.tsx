"use client";

import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent } from "@/src/components/ui/card";
import { EpisodeActions } from "./episode-actions";
import { Episode, SortDirection } from "@/src/lib/types";
import { formatTime } from "@/src/lib/utils";
import { ChevronsUpDown, ArrowDown, ArrowUp } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";

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
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: episodes.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 65,
    overscan: 5,
  });

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
  const columns = [
    {
      id: "thumbnail",
      header: "",
      width: "w-12",
      cell: () => <div className="w-12"></div>,
    },
    {
      id: "status",
      header: "Status",
      width: "min-w-[100px] flex-1",
      cell: (episode: Episode) => getStatusBadge(episode.status),
    },
    {
      id: "title",
      header: "Título",
      width: "min-w-[250px] flex-1",
      cell: (episode: Episode) => (
        <div className="font-medium truncate max-w-xs">{episode.title}</div>
      ),
    },
    {
      id: "duration",
      header: "Duração",
      width: "min-w-[100px] flex-1",
      className: "hidden md:flex",
      cell: (episode: Episode) => (
        <>
          {episode.duration_in_seconds
            ? formatTime(episode.duration_in_seconds)
            : "--:--"}
        </>
      ),
    },
    {
      id: "category",
      header: "Categoria",
      width: "min-w-[150px] flex-1",
      className: "hidden md:flex",
      cell: (episode: Episode) => <>{episode.categories?.name || "N/A"}</>,
    },
    {
      id: "published_at",
      header: "Data",
      width: "min-w-[150px] flex-1",
      className: "hidden xl:flex",
      isSortable: true,
      cell: (episode: Episode) => <>{formatDate(episode.published_at)}</>,
    },
    {
      id: "view_count",
      header: "Visualizações",
      width: "min-w-[120px] flex-1",
      className: "hidden md:flex",
      isSortable: true,
      cell: (episode: Episode) => <>{episode.view_count}</>,
    },
    {
      id: "actions",
      header: "Ações",
      width: "w-24",
      cell: (episode: Episode) => (
        <EpisodeActions episode={episode} onEpisodeUpdate={onEpisodeUpdate} />
      ),
    },
  ];

  return (
    <Card>
      <CardContent className="p-0">
        <div ref={parentRef} className="overflow-auto max-h-[50vh]">
          <div style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
            <div className="flex items-center border-b border-border sticky top-0 bg-card z-10">
              {columns.map((column) =>
                column.isSortable ? (
                  <div
                    key={column.id}
                    className={`py-2 px-4 font-medium text-muted-foreground flex items-center ${
                      column.width
                    } ${column.className || ""}`}
                  >
                    <Button
                      variant="ghost"
                      onClick={() => onSort(column.id as keyof Episode)}
                      className={`px-0 hover:bg-transparent ${
                        sortColumn === column.id ? "text-primary" : ""
                      }`}
                    >
                      {column.header}
                      <span className="ml-0.1">
                        {renderSortIcon(column.id as keyof Episode)}
                      </span>
                    </Button>
                  </div>
                ) : (
                  <div
                    key={column.id}
                    className={`py-2 px-4 font-medium text-muted-foreground ${
                      column.width
                    } ${column.className || ""}`}
                  >
                    {column.header}
                  </div>
                )
              )}
            </div>
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                position: "relative",
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                const episode = episodes[virtualItem.index];
                return (
                  <div
                    key={episode.id}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: `${virtualItem.size}px`,
                      transform: `translateY(${virtualItem.start}px)`,
                    }}
                    className="flex items-center border-b border-border hover:bg-muted/50"
                  >
                    {columns.map((column) => (
                      <div
                        key={column.id}
                        className={`py-2 px-4 flex items-center ${
                          column.width
                        } ${column.className || ""}`}
                      >
                        {column.cell(episode)}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
