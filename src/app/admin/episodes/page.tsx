// src/app/admin/episodes/page.tsx
import { EpisodeManager } from "@/src/components/features/admin/episode-management/episode-manager";
import {
  getEpisodesWithRelations,
  getEpisodesCount,
} from "@/src/services/episodeService"; // Mantemos este, pois é específico para episódios
import { getEpisodeStatusCounts } from "@/src/services/adminService"; // E este para as contagens de status

// IMPORTANTE: Importamos as novas funções do nosso serviço de servidor
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

  // Busca todos os dados em paralelo no servidor, usando as funções corretas
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
    // Usando as novas funções de servidor
    getCategoriesForServer(),
    getSubcategoriesForServer(),
    getProgramsForServer(),
    getEpisodeStatusCounts(),
    getTagsForServer(),
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
