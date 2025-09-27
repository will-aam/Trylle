"use server";

import { createServerActionClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

// Function to create a Supabase client for Server Actions
function createSupabaseServerActionClient() {
  const cookieStore = cookies();
  return createServerActionClient({ cookies: () => cookieStore });
}

// Function to create a Supabase ADMIN client on the server
function createSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

export const getDashboardStats = async () => {
  const supabase = createSupabaseServerActionClient();
  const supabaseAdmin = createSupabaseAdminClient();

  try {
    const { count: episodeCount, error: episodeError } = await supabase
      .from("episodes")
      .select("*", { count: "exact", head: true });

    if (episodeError) {
      console.error("Error fetching episode count:", episodeError);
      throw new Error("Could not fetch episode count.");
    }

    const { data, error: userError } =
      await supabaseAdmin.auth.admin.listUsers();

    if (userError) {
      console.error("Error fetching user count:", userError.message);
      throw new Error("Could not fetch user count.");
    }

    return {
      data: {
        episodeCount: episodeCount ?? 0,
        userCount: data.users.length ?? 0,
      },
      error: null,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      data: null,
      error: "Failed to fetch dashboard statistics.",
    };
  }
};

export const revalidateAdminDashboard = async () => {
  revalidatePath("/admin"); // This tells Next.js to reload data for the /admin page
};
