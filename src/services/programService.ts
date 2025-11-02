// src/services/programService.ts

import { createSupabaseServerClient } from "@/src/lib/supabase-server";
import { Program } from "@/src/lib/types";
import { unstable_noStore as noStore } from "next/cache";

export async function getPrograms() {
  noStore();
  const supabase = await createSupabaseServerClient();
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
  const supabase = await createSupabaseServerClient();
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
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("programs")
    .insert([program])
    .select("*, category:categories(*)")
    .single();
  if (error) {
    console.error("Error creating program:", error);
    return null;
  }
  return data;
}

export async function updateProgram(id: string, program: Partial<Program>) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("programs")
    .update(program)
    .eq("id", id)
    .select("*, category:categories(*)")
    .single();
  if (error) {
    console.error("Error updating program:", error);
    return null;
  }
  return data;
}

export async function deleteProgram(id: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("programs").delete().eq("id", id);
  if (error) {
    console.error("Error deleting program:", error);
    return false;
  }
  return true;
}

export async function getCategories() {
  noStore();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("categories").select("*");

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
  return data;
}

export async function getProgramsWithRelations(page: number, perPage: number) {
  noStore();
  const supabase = await createSupabaseServerClient();

  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const { data, error, count } = await supabase
    .from("programs")
    .select(
      `
      *,
      categories!left (
        id,
        name
      ),
      episodes (
        count
      )
    `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Error fetching paginated programs with relations:", error);
    // Retorna um objeto com dados e contagem em caso de erro
    return { data: [], count: 0 };
  }

  // A sua lógica original para mapear a contagem de episódios
  const programs = data.map((program) => ({
    ...program,
    _count: {
      episodes: program.episodes[0]?.count ?? 0,
    },
  }));

  // Retorna os dados da página e a contagem total
  return { data: programs, count: count ?? 0 };
}
// (cole isso no final de src/services/programService.ts)

export async function getProgramWithEpisodes(programId: string) {
  noStore(); // Garante que esta função sempre busque dados novos
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("programs")
    .select(
      `
      *,
      categories (id, name),
      episodes (
        id,
        title,
        description,
        audio_url,
        episode_number,
        created_at,
        status
      )
    `
    )
    .eq("id", programId)
    .order("episode_number", { referencedTable: "episodes", ascending: true }) // Ordena os episódios
    .single(); // Esperamos apenas um programa

  if (error) {
    console.error(
      `Error fetching program with episodes (ID: ${programId}):`,
      error
    );
    return null;
  }

  return data;
}
