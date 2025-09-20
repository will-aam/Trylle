import { EpisodeCard } from "./episode-card";
import { Episode } from "@/src/lib/types";

interface RecentEpisodesProps {
  episodes: Episode[];
}

export function RecentEpisodes({ episodes }: RecentEpisodesProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {episodes.map((episode) => (
        <EpisodeCard key={episode.id} episode={episode} />
      ))}
    </div>
  );
}
