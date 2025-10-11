import { Episode } from "@/src/lib/types";
import { Sidebar } from "@/src/components/layout/sidebar";
import { Greeting } from "./greeting";
import { NewEpisodesCarousel } from "./new-episodes-carousel";
import { RecentPlaylists } from "./recent-playlists";
import { WelcomeModal } from "../welcome-modal";

interface HomeLoggedInProps {
  publishedEpisodes: Episode[];
}

export function HomeLoggedIn({ publishedEpisodes }: HomeLoggedInProps) {
  return (
    <>
      <Sidebar />
      <main className="lg:ml-48 p-4 lg:p-6 xl:p-8">
        <WelcomeModal />
        <Greeting />
        <div className="mt-8 space-y-12">
          <RecentPlaylists />
          <NewEpisodesCarousel />
        </div>
      </main>
    </>
  );
}
