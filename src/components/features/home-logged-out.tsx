import { UpcomingEpisodesCarousel } from "@/src/components/landing/upcoming-episodes-carousel";
import { ExploreCategories } from "@/src/components/landing/explore-categories";
import { PdfInfoSection } from "@/src/components/landing/pdf-info-section";
import { ListeningStatistics } from "@/src/components/landing/listening-statistics";
import { PremiumPlans } from "@/src/components/landing/premium-plans";
import { Hero } from "@/src/components/features/hero";
import { Episode } from "@/src/lib/types";

interface HomeLoggedOutProps {
  scheduledEpisodes: Episode[];
}

export function HomeLoggedOut({ scheduledEpisodes }: HomeLoggedOutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <UpcomingEpisodesCarousel episodes={scheduledEpisodes} />
      <ExploreCategories />
      <PdfInfoSection />
      <ListeningStatistics />
      <PremiumPlans />
    </div>
  );
}
