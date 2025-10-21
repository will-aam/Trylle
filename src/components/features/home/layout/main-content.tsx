import { HeroSection } from "./hero-section";
import { NewEpisodesCarousel } from "./new-episodes-carousel";

import { RecentsSection } from "./recents-section";

export function MainContent() {
  return (
    <main className="flex-1 overflow-y-auto">
      <div className="p-8 space-y-8">
        <HeroSection />
        <NewEpisodesCarousel />
        <RecentsSection />
      </div>
    </main>
  );
}
