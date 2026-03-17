// src/app/(main)/page.tsx
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { HomeLoggedIn } from "@/src/components/features/home/home-logged-in";
import { Episode } from "@/src/lib/types";

export default async function HomePage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    },
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // SE NÃO ESTIVER LOGADO: Redireciona imediatamente para a tela de autenticação
  if (!session) {
    redirect("/auth");
  }

  // SE ESTIVER LOGADO: Busca apenas os episódios necessários para o dashboard
  const { data: publishedEpisodes } = await supabase
    .from("episodes")
    .select("*, categories(name), subcategories(name), tags(name)")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  return (
    <HomeLoggedIn publishedEpisodes={(publishedEpisodes as Episode[]) || []} />
  );
}
