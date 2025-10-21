import { Episode } from "@/src/lib/types";
import MusicDashboard from "@/src/components/features/home/layout/music-dashboard";

interface HomeLoggedInProps {
  publishedEpisodes: Episode[];
}

export function HomeLoggedIn({ publishedEpisodes }: HomeLoggedInProps) {
  return (
    <>
      {/* <Sidebar /> */}
      <main className="lg:ml-48 p-4 lg:p-6 xl:p-8">
        <MusicDashboard />
      </main>
    </>
  );
}
