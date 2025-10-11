// src/app/admin/episodes/page.tsx

import { EpisodeManager } from "@/src/components/features/admin/episode-management/episode-manager";
import { createSupabaseServerClient } from "@/src/lib/supabase-server";

export const revalidate = 0;

// Não precisamos mais passar os searchParams, então a tipagem aqui pode ser simplificada
// ou removida, mas vamos manter por clareza de que a página os recebe.
export default async function AdminEpisodesPage() {
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

  const normalizedPrograms =
    (programsData || []).map((p: any) => ({
      ...p,
      category: null,
    })) || [];

  return (
    <EpisodeManager
      initialCategories={categoriesData || []}
      initialSubcategories={subcategoriesData || []}
      initialPrograms={normalizedPrograms}
      initialAllTags={tagsData || []}
      // A propriedade searchParams foi REMOVIDA daqui, pois o componente já a lê internamente.
    />
  );
}
