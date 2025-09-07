import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { ListMusic, CheckCircle, Clock, Archive } from "lucide-react";
import type { Episode } from "./episode-management";

interface EpisodeStatsProps {
  episodes: Episode[];
}

export function EpisodeStats({ episodes }: EpisodeStatsProps) {
  const totalEpisodes = episodes.length;
  const publishedCount = episodes.filter(
    (ep) => ep.status === "published"
  ).length;
  const draftCount = episodes.filter((ep) => ep.status === "draft").length;
  const scheduledCount = episodes.filter(
    (ep) => ep.status === "scheduled"
  ).length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total de Episódios
          </CardTitle>
          <ListMusic className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalEpisodes}</div>
          <p className="text-xs text-muted-foreground">Episódios no sistema</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Publicados</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{publishedCount}</div>
          <p className="text-xs text-muted-foreground">
            Visíveis para o público
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Rascunhos</CardTitle>
          <Archive className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{draftCount}</div>
          <p className="text-xs text-muted-foreground">Aguardando publicação</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Agendados</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{scheduledCount}</div>
          <p className="text-xs text-muted-foreground">Publicação futura</p>
        </CardContent>
      </Card>
    </div>
  );
}
