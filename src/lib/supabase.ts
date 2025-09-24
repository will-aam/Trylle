import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Episode = {
  id: string;
  title: string;
  description: string | null;
  audio_url: string;
  file_name: string;
  category_id: string | null;
  subcategory_id: string | null;
  tags: string[] | null;
  published_at: string;
  created_at: string;
  updated_at: string;
  categories?: { name: string };
  subcategories?: { name: string };
};

export type Category = {
  id: string;
  name: string;
  created_at: string;
};

export type Subcategory = {
  id: string;
  name: string;
  category_id: string;
  created_at: string;
  categories?: { name: string };
};

export { createClient };
