// src/components/features/home/layout/main-content.tsx
import { getActiveProgramsWithCategories } from "@/src/services/serverDataService";
import { CategoriesPills } from "./categories-pills";
import { HeroSection } from "./hero-section";
import { NextEpisodesCarousel } from "./next-episodes-carousel";
import { RecentsSection } from "./recents-section";

export async function MainContent() {
  const programs = await getActiveProgramsWithCategories();
  return (
    <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
      <HeroSection programs={programs || []} />
      <NextEpisodesCarousel />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoriesPills />
        <RecentsSection />
      </div>
    </div>
  );
}
