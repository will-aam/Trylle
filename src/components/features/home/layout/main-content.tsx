import { HeroSection } from "./hero-section";
import { NewEpisodesCarousel } from "./new-episodes-carousel";
import { CategoriesPills } from "./categories-pills";

import { RecentsSection } from "./recents-section";

export function MainContent() {
  return (
    <main className="h-full overflow-y-auto">
      <div className="p-6 md:p-8 pb-28 md:pb-8 space-y-8">
        <HeroSection />
        <NewEpisodesCarousel />
        {/* blocos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CategoriesPills />
          <RecentsSection />
        </div>
      </div>
    </main>
  );
}
