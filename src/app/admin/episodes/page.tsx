import { EpisodeManager } from "@/src/components/features/admin/episode-management/episode-manager";
import {
  getEpisodesWithRelations,
  getEpisodesCount,
} from "@/src/services/episodeService";
import { getEpisodeStatusCounts } from "@/src/services/adminService";
import {
  getCategoriesForServer,
  getSubcategoriesForServer,
  getProgramsForServer,
  getTagsForServer,
} from "@/src/services/serverDataService";

export const revalidate = 0;

export default async function AdminEpisodesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const sp = await searchParams;

  const searchTerm = sp.q?.trim() || "";
  const status = sp.status || "all";
  const categoryId = sp.category || "all";
  const page = safePositiveInt(sp.page, 1);
  const limit = safePositiveInt(sp.limit, 5);
  const sortBy = (sp.sortBy as any) || "published_at";
  const ascending = sp.order === "asc";
  const offset = (page - 1) * limit;

  const [
    episodesResult,
    totalCount,
    categoriesResult,
    subcategoriesResult,
    programsResult,
    statusCountsResult,
    tagsResult,
  ] = await Promise.all([
    getEpisodesWithRelations({
      limit,
      offset,
      searchTerm,
      status,
      categoryId,
      sortBy,
      ascending,
    }),
    getEpisodesCount({ searchTerm, status, categoryId }),
    getCategoriesForServer(),
    getSubcategoriesForServer(),
    getProgramsForServer(),
    getEpisodeStatusCounts(),
    getTagsForServer(),
  ]);

  return (
    <EpisodeManager
      initialEpisodes={episodesResult}
      initialTotalEpisodes={totalCount}
      initialCategories={categoriesResult}
      initialSubcategories={subcategoriesResult}
      initialPrograms={programsResult}
      initialStatusCounts={statusCountsResult}
      initialAllTags={tagsResult}
    />
  );
}

function safePositiveInt(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback;
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : fallback;
}
