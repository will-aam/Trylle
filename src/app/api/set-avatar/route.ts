import { createRouteHandlerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Admin client: initialized with service role key for elevated privileges
const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // If the user already has an avatar, do nothing.
    if (user.user_metadata?.avatar_url) {
      return NextResponse.json({
        ok: true,
        avatar: user.user_metadata.avatar_url,
      });
    }

    // Generate DiceBear avatar URL
    const seed = encodeURIComponent(
      user.user_metadata?.name || user.email || user.id
    );
    const avatarUrl = `https://api.dicebear.com/8.x/thumbs/svg?seed=${seed}`;

    // Update user metadata using the admin client
    const { error: updateError } =
      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        user_metadata: { ...(user.user_metadata || {}), avatar_url: avatarUrl },
      });

    if (updateError) {
      console.error("Supabase admin update error:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, avatar: avatarUrl });
  } catch (err: any) {
    console.error("Unexpected error in set-avatar API:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
