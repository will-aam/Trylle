// src/app/admin/episodes/page.tsx
import { EpisodeManager } from "@/src/components/features/admin/episode-management/episode-manager";
import {
  getEpisodesWithRelations,
  getEpisodesCount,
} from "@/src/services/episodeService";
import { getCategories } from "@/src/services/categoryService";
import { getSubcategories } from "@/src/services/subcategoryService";
import { getPrograms } from "@/src/services/programService";
import { getTags } from "@/src/services/tagService";
import { getEpisodeStatusCounts } from "@/src/services/adminService";

// Define que esta página não deve usar cache
export const revalidate = 0;

export default async function AdminEpisodesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const searchTerm = searchParams.q || "";
  const status = searchParams.status || "all";
  const categoryId = searchParams.category || "all";
  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || 10;
  const sortBy = (searchParams.sortBy as any) || "published_at";
  const ascending = searchParams.order === "asc";
  const offset = (page - 1) * limit;

  // Busca todos os dados em paralelo no servidor
  const [
    episodesResult,
    count,
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
    getCategories(),
    getSubcategories(),
    getPrograms(),
    getEpisodeStatusCounts(),
    getTags(),
  ]);

  return (
    <EpisodeManager
      initialEpisodes={episodesResult}
      initialTotalEpisodes={count}
      initialCategories={categoriesResult}
      initialSubcategories={subcategoriesResult}
      initialPrograms={programsResult}
      initialStatusCounts={statusCountsResult}
      initialAllTags={tagsResult}
    />
  );
}
