import { Episode } from "@/src/lib/types";
import { Sidebar } from "@/src/components/layout/sidebar";
import { Greeting } from "./greeting";
import { NewEpisodesCarousel } from "./new-episodes-carousel";
import { ThemeToggle } from "@/src/components/layout/theme-toggle";

interface HomeLoggedInProps {
  publishedEpisodes: Episode[];
}

export function HomeLoggedIn({ publishedEpisodes }: HomeLoggedInProps) {
  return (
    <div className="h-screen bg-background flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Hidden on mobile */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Greeting ao lado do Sidebar */}
        <div className="flex-1 p-4 overflow-y-auto">
          {/* <ThemeToggle /> */}
          <Greeting />
          <NewEpisodesCarousel />
        </div>
      </div>
    </div>
  );
}
