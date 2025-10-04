import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { ListMusic, CheckCircle, Clock, Archive } from "lucide-react";

interface EpisodeStatsProps {
  totalCount: number; // This remains the count based on active filters
  publishedCount: number; // This is the GLOBAL count of all published episodes
  draftCount: number; // This is the GLOBAL count of all draft episodes
  scheduledCount: number; // This is the GLOBAL count of all scheduled episodes
}

export function EpisodeStats({
  totalCount,
  publishedCount,
  draftCount,
  scheduledCount,
}: EpisodeStatsProps) {
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
          <div className="text-2xl font-bold">{totalCount}</div>
          <p className="text-xs text-muted-foreground">
            Episódios correspondentes
          </p>
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
            Total de publicados no sistema
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
          <p className="text-xs text-muted-foreground">
            Total de rascunhos no sistema
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Agendados</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{scheduledCount}</div>
          <p className="text-xs text-muted-foreground">
            Total de agendados no sistema
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
