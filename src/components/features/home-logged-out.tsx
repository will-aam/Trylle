import { UpcomingEpisodesCarousel } from "@/src/components/landing/upcoming-episodes-carousel";
// import { ExploreCategories } from "@/src/components/landing/explore-categories";
// import { PremiumPlans } from "@/src/components/landing/premium-plans";
import { ListeningStatistics } from "@/src/components/landing/listening-statistics";
import { Hero } from "@/src/components/landing/hero";
import { Episode } from "@/src/lib/types";
import { ProblemSection } from "@/src/components/landing/problem-section";
import { SolutionSection } from "@/src/components/landing/solution-section";
import { UniqueFeatureSection } from "@/src/components/landing/unique-feature-section";
import { FinalCTASection } from "@/src/components/landing/final-cta-section";
import { FAQSection } from "@/src/components/landing/faq-section";
interface HomeLoggedOutProps {
  scheduledEpisodes: Episode[];
}

export function HomeLoggedOut({ scheduledEpisodes }: HomeLoggedOutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <UpcomingEpisodesCarousel />
      <ProblemSection />
      <SolutionSection />
      <UniqueFeatureSection />
      <ListeningStatistics />
      {/* <ExploreCategories /> */}
      {/* <PremiumPlans /> */}
      <FinalCTASection />
      <FAQSection />
    </div>
  );
}
