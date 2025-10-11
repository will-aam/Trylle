// src/app/(main)/Schedule/page.tsx

import {
  getScheduledEpisodes,
  ScheduledEpisode,
} from "@/src/services/serverDataService";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Helper para agrupar por data
function groupEpisodesByDate(episodes: ScheduledEpisode[]) {
  return episodes.reduce((acc, episode) => {
    // CORREÇÃO: Usando 'published_at'
    const date = format(new Date(episode.published_at), "yyyy-MM-dd");
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(episode);
    return acc;
  }, {} as Record<string, ScheduledEpisode[]>);
}

export default async function ProgramacaoPage() {
  const scheduledEpisodes = await getScheduledEpisodes();
  const episodesByDate = groupEpisodesByDate(scheduledEpisodes);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Nossa Programação</h1>

      {Object.keys(episodesByDate).length === 0 ? (
        <p className="text-muted-foreground">
          Nenhum episódio programado no momento. Volte em breve!
        </p>
      ) : (
        <div className="space-y-8">
          {Object.entries(episodesByDate).map(([date, episodes]) => (
            <div key={date}>
              <h2 className="text-xl font-semibold mb-3 capitalize">
                {format(new Date(date), "EEEE, dd 'de' MMMM", { locale: ptBR })}
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {episodes.map((episode) => (
                  <Card key={episode.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{episode.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex space-x-2">
                        {/* CORREÇÃO: Usando 'categories' e 'subcategories' */}
                        {episode.categories && (
                          <Badge variant="secondary">
                            {episode.categories.name}
                          </Badge>
                        )}
                        {episode.subcategories && (
                          <Badge variant="outline">
                            {episode.subcategories.name}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
