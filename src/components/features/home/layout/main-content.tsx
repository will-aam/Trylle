// src/components/features/home/layout/main-content.tsx
import { HeroSection } from "./hero-section";
import { NewEpisodesCarousel } from "./new-episodes-carousel";
import { CategoriesPills } from "./categories-pills";
import { RecentsSection } from "./recents-section";

export function MainContent() {
  return (
    <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
      <HeroSection />
      <NewEpisodesCarousel />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoriesPills />
        <RecentsSection />
      </div>
    </div>
  );
}
