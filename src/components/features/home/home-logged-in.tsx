import { Episode } from "@/src/lib/types";
import { Sidebar } from "@/src/components/features/home/layout/sidebar";
import { Greeting } from "./greeting";
import { NewEpisodesCarousel } from "./new-episodes-carousel";
import { RecentPlaylists } from "./recent-playlists";
import { WelcomeModal } from "../welcome-modal";
import { RecommendedForYouCarousel } from "./RecommendedForYouCarousel";
import { CategoryGrid } from "../category-grid";
import { FeaturedProgramsCarousel } from "./featured-programs-carousel";
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
