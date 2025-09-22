import { createClient } from "@/src/lib/supabase-client";
import { Episode, Category, SortDirection } from "@/src/lib/types";

// Este cliente usa a chave anônima e é seguro para o cliente
const supabase = createClient();

type FetchEpisodesParams = {
  currentPage: number;
  itemsPerPage: number;
  searchTerm: string;
  statusFilter: string[];
  categoryFilter: string[];
  sortColumn: keyof Episode | "";
  sortDirection: SortDirection;
};

export const getEpisodes = async ({
  currentPage,
  itemsPerPage,
  searchTerm,
  statusFilter,
  categoryFilter,
  sortColumn,
  sortDirection,
}: FetchEpisodesParams) => {
  const from = (currentPage - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;

  let query = supabase
    .from("episodes")
    .select(`*, categories (name), tags:episode_tags (tags (id, name))`, {
      count: "exact",
    });

  if (searchTerm) {
    query = query.ilike("title", `%${searchTerm}%`);
  }
  if (statusFilter.length > 0) {
    query = query.in("status", statusFilter);
  }
  if (categoryFilter.length > 0) {
    query = query.in("category_id", categoryFilter);
  }

  query = query
    .order(sortColumn || "published_at", {
      ascending: sortDirection === "asc",
    })
    .range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching episodes:", error);
    throw new Error("Could not fetch episodes.");
  }

  return { data: data as Episode[], count };
};

export const getEpisodeStatusCounts = async () => {
  const { data, error } = await supabase.from("episodes").select("status");

  if (error) {
    console.error("Error fetching status counts:", error);
    throw new Error("Could not fetch episode status counts.");
  }

  const counts = { published: 0, draft: 0, scheduled: 0 };
  data.forEach((ep) => {
    if (ep.status === "published") {
      counts.published++;
    } else if (ep.status === "draft") {
      counts.draft++;
    } else if (ep.status === "scheduled") {
      counts.scheduled++;
    }
  });

  return counts;
};

export const getCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase.from("categories").select("*");

  if (error) {
    console.error("Error fetching categories:", error);
    throw new Error("Could not fetch categories.");
  }

  return data as Category[];
};

type GetAllEpisodeIdsParams = {
  searchTerm: string;
  statusFilter: string[];
  categoryFilter: string[];
};

export const getAllEpisodeIds = async ({
  searchTerm,
  statusFilter,
  categoryFilter,
}: GetAllEpisodeIdsParams): Promise<string[]> => {
  let query = supabase.from("episodes").select("id");

  if (searchTerm) {
    query = query.ilike("title", `%${searchTerm}%`);
  }
  if (statusFilter.length > 0) {
    query = query.in("status", statusFilter);
  }
  if (categoryFilter.length > 0) {
    query = query.in("category_id", categoryFilter);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching episode IDs:", error);
    throw new Error("Could not fetch episode IDs.");
  }

  return data.map((e) => e.id);
};

export const updateEpisodeStatus = async (
  episodeIds: string[],
  newStatus: "published" | "draft"
) => {
  const { error } = await supabase
    .from("episodes")
    .update({ status: newStatus })
    .in("id", episodeIds);

  if (error) {
    console.error("Error updating episodes:", error);
    throw new Error("Could not update episode status.");
  }
};

// A função getDashboardStats foi removida daqui
