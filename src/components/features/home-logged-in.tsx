import { FeaturedEpisodes } from "@/src/components/features/featured-episodes";
import { RecentEpisodes } from "@/src/components/features/recent-episodes";
import { CategoryCarousel } from "./category-carousel";
import { Episode } from "@/src/lib/types";

interface HomeLoggedInProps {
  publishedEpisodes: Episode[];
}

export function HomeLoggedIn({ publishedEpisodes }: HomeLoggedInProps) {
  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-2xl font-bold tracking-tight mb-4">
          Recently Played
        </h2>
        <RecentEpisodes episodes={publishedEpisodes} />
      </section>

      <section>
        <h2 className="text-2xl font-bold tracking-tight mb-4">
          Browse Categories
        </h2>
        <CategoryCarousel />
      </section>

      <section>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Made for You</h2>
        <FeaturedEpisodes />
      </section>
    </div>
  );
}
