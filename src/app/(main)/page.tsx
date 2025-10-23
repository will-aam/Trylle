// src/app/(main)/page.tsx
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { HomeLoggedIn } from "@/src/components/features/home/home-logged-in";
import { HomeLoggedOut } from "@/src/components/features/home-logged-out";
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
    }
  );
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { data: publishedEpisodes } = await supabase
    .from("episodes")
    .select("*, categories(name), subcategories(name), tags(name)")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  const { data: scheduledEpisodes } = await supabase
    .from("episodes")
    .select("*, categories(name), subcategories(name), tags(name)")
    .eq("status", "scheduled")
    .order("published_at", { ascending: true });

  return session ? (
    <HomeLoggedIn publishedEpisodes={(publishedEpisodes as Episode[]) || []} />
  ) : (
    <HomeLoggedOut scheduledEpisodes={(scheduledEpisodes as Episode[]) || []} />
  );
}
