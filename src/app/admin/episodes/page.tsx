import { EpisodeManager } from "@/src/components/features/admin/episode-management/episode-manager";
import { createSupabaseServerClient } from "@/src/lib/supabase-server";

export const revalidate = 0;

export default async function AdminEpisodesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = await createSupabaseServerClient();

  const [
    { data: categoriesData },
    { data: subcategoriesData },
    { data: programsData },
    { data: tagsData },
  ] = await Promise.all([
    supabase.from("categories").select("id,name,created_at").order("name"),
    supabase
      .from("subcategories")
      .select("id,name,category_id,created_at")
      .order("name"),
    supabase
      .from("programs")
      .select("id,title,description,category_id,created_at,updated_at")
      .order("title"),
    supabase.from("tags").select("id,name,created_at").order("name"),
  ]);

  // Normaliza para satisfazer a interface Program (que exige 'category')
  const normalizedPrograms =
    (programsData || []).map((p: any) => ({
      ...p,
      category: null, // placeholder (já que Program.category é 'any')
    })) || [];

  return (
    <EpisodeManager
      initialCategories={categoriesData || []}
      initialSubcategories={subcategoriesData || []}
      initialPrograms={normalizedPrograms}
      initialAllTags={tagsData || []}
    />
  );
}
