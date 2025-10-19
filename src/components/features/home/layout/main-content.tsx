import { HeroSection } from "./hero-section"
import { PopularSongs } from "./popular-songs"
import { GenrePills } from "./genre-pills"
import { RecentsSection } from "./recents-section"

export function MainContent() {
  return (
    <main className="flex-1 overflow-y-auto">
      <div className="p-8 space-y-8">
        <HeroSection />
        <PopularSongs />
        <GenrePills />
        <RecentsSection />
      </div>
    </main>
  )
}
