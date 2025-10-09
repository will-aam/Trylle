import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import AchievementsPage from "@/src/components/achievements/AchievementsPage";
import { type Achievement } from "@/src/components/achievements/AchievementCard";
import {
  Medal,
  Star,
  Zap,
  Coffee,
  Wind,
  Target,
  BookOpen,
  Clock,
} from "lucide-react";

// Map DB icon names to Lucide components
const iconMap: Record<string, React.ReactNode> = {
  Medal: <Medal className="h-6 w-6" />,
  Star: <Star className="h-6 w-6" />,
  Zap: <Zap className="h-6 w-6" />,
  Coffee: <Coffee className="h-6 w-6" />,
  Wind: <Wind className="h-6 w-6" />,
  Target: <Target className="h-6 w-6" />,
  BookOpen: <BookOpen className="h-6 w-6" />,
  Clock: <Clock className="h-6 w-6" />,
};

export default async function AchievementsRoutePage() {
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

  if (!session) {
    redirect("/auth");
  }

  const userId = session.user.id;

  // Fetch all achievements and user's unlocked achievements in parallel
  const [allAchievementsResponse, userAchievementsResponse] = await Promise.all([
    supabase.from("achievements").select("id,name,description,icon_name"),
    supabase
      .from("user_achievements")
      .select("achievement_id")
      .eq("user_id", userId),
  ]);

  const { data: allAchievements, error: allError } = allAchievementsResponse;
  const { data: userAchievements, error: userError } = userAchievementsResponse;

  if (allError || userError) {
    console.error(allError || userError);
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">My Achievements</h1>
        <p className="text-sm text-muted-foreground">Error loading achievements.</p>
      </div>
    );
  }

  const unlockedAchievementIds = new Set(
    (userAchievements ?? []).map((ua) => ua.achievement_id as string)
  );

  const processed: Achievement[] = (allAchievements ?? []).map((ach) => ({
    id: String(ach.id),
    name: ach.name as string,
    description: ach.description as string,
    icon: iconMap[(ach as any).icon_name as string] ?? <Medal className="h-6 w-6" />,
    unlocked: unlockedAchievementIds.has(ach.id as string),
  }));

  return <AchievementsPage achievements={processed} />;
}
