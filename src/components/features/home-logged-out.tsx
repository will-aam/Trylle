// import { Navbar } from "@/src/components/layout/navbar";
// import { Footer } from "@/src/components/layout/footer";
import { UpcomingEpisodesCarousel } from "@/src/components/landing/upcoming-episodes-carousel";
import { ExploreCategories } from "@/src/components/landing/explore-categories";
import { PdfInfoSection } from "@/src/components/landing/pdf-info-section";
import { ListeningStatistics } from "@/src/components/landing/listening-statistics";
import { PremiumPlans } from "@/src/components/landing/premium-plans";
import { Button } from "@/src/components/ui/button";
import { Play, Headphones } from "lucide-react";
import { Hero } from "@/src/components/features/hero";

export function HomeLoggedOut() {
  return (
    <div className="min-h-screen bg-background">
      {/* <Navbar /> */}

      {/* Hero Banner Section */}
      <Hero />
      <UpcomingEpisodesCarousel />
      <ExploreCategories />
      <PdfInfoSection />
      <ListeningStatistics />

      <PremiumPlans />

      {/* <Footer /> */}
    </div>
  );
}
