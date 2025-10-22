// src/components/features/home/home-logged-in.tsx
import { Episode } from "@/src/lib/types";
import MusicDashboard from "@/src/components/features/home/layout/music-dashboard";

interface HomeLoggedInProps {
  publishedEpisodes: Episode[];
}

export function HomeLoggedIn({ publishedEpisodes }: HomeLoggedInProps) {
  return (
    <>
      <MusicDashboard />
    </>
  );
}
