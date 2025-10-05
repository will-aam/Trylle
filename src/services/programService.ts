import { createSupabaseServerClient } from "@/src/lib/supabase-server";
import { Program } from "@/src/lib/types";
import { unstable_noStore as noStore } from "next/cache";

export async function getPrograms() {
  noStore();
  const supabase = await createSupabaseServerClient(); // <-- ADICIONADO AWAIT
  const { data, error } = await supabase.from("programs").select(`
      *,
      category:categories(name)
    `);

  if (error) {
    console.error("Error fetching programs:", error);
    return [];
  }
  return data;
}

export async function getProgramById(id: string) {
  noStore();
  const supabase = await createSupabaseServerClient(); // <-- ADICIONADO AWAIT
  const { data, error } = await supabase
    .from("programs")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching program by id:", error);
    return null;
  }
  return data;
}

export async function createProgram(
  program: Omit<Program, "id" | "created_at">
) {
  const supabase = await createSupabaseServerClient(); // <-- ADICIONADO AWAIT
  const { data, error } = await supabase
    .from("programs")
    .insert([program])
    .select()
    .single();
  if (error) {
    console.error("Error creating program:", error);
    return null;
  }
  return data;
}

export async function updateProgram(id: string, program: Partial<Program>) {
  const supabase = await createSupabaseServerClient(); // <-- ADICIONADO AWAIT
  const { data, error } = await supabase
    .from("programs")
    .update(program)
    .eq("id", id)
    .select()
    .single();
  if (error) {
    console.error("Error updating program:", error);
    return null;
  }
  return data;
}

export async function deleteProgram(id: string) {
  const supabase = await createSupabaseServerClient(); // <-- ADICIONADO AWAIT
  const { error } = await supabase.from("programs").delete().eq("id", id);
  if (error) {
    console.error("Error deleting program:", error);
    return false;
  }
  return true;
}

export async function getCategories() {
  noStore();
  const supabase = await createSupabaseServerClient(); // <-- ADICIONADO AWAIT
  const { data, error } = await supabase.from("categories").select("*");

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
  return data;
}
