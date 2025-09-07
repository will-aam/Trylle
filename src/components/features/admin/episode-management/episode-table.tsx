"use client";

import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent } from "@/src/components/ui/card";
import { Checkbox } from "@/src/components/ui/checkbox";
import { EpisodeActions } from "./episode-actions";
import type { Episode } from "./episode-management";

interface EpisodeTableProps {
  episodes: Episode[];
  setEpisodes: (episodes: Episode[]) => void;
}

export function EpisodeTable({ episodes }: EpisodeTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
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
          <Badge variant="outline" className="border-blue-500 text-blue-500">
            Agendado
          </Badge>
        );
      case "archived":
        return (
          <Badge
            variant="destructive"
            className="bg-gray-500 hover:bg-gray-600"
          >
            Arquivado
          </Badge>
        );
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="p-4 w-12">
                  <Checkbox />
                </th>
                <th className="text-left p-4 font-medium text-muted-foreground">
                  Status
                </th>
                <th className="text-left p-4 font-medium text-muted-foreground">
                  Título
                </th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">
                  Categoria
                </th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden lg:table-cell">
                  Tags
                </th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden xl:table-cell">
                  Data
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
                  <td className="p-4">
                    <Checkbox />
                  </td>
                  <td className="p-4">{getStatusBadge(episode.status)}</td>
                  <td className="p-4">
                    <div className="font-medium truncate max-w-xs">
                      {episode.title}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {episode.duration}
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    {episode.category}
                  </td>
                  <td className="p-4 hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {episode.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                      {episode.tags.length > 2 && (
                        <Badge variant="outline">
                          +{episode.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-sm hidden xl:table-cell">
                    {formatDate(episode.publicationDate)}
                  </td>
                  <td className="p-4">
                    <EpisodeActions episode={episode} />
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
