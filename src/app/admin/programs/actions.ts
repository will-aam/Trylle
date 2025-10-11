// src/app/admin/programs/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { getProgramsWithRelations } from "@/src/services/programService";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Program } from "@/src/lib/types";

const createSupabaseServerClient = async () => {
  const cookieStore = await cookies();
  return createServerClient(
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
};

type ProgramActionResponse = {
  success: boolean;
  message: string;
  program?: Program;
};

type ProgramFormData = {
  title: string;
  description: string;
  category_id: string;
};

export async function createProgram(
  formData: ProgramFormData
): Promise<ProgramActionResponse> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await (await supabase)
    .from("programs")
    .insert(formData)
    .select(`*, categories(*)`)
    .single();

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/admin/programs");
  return {
    success: true,
    message: "Programa criado com sucesso.",
    program: data,
  };
}

export async function updateProgram(
  programId: string,
  formData: ProgramFormData
): Promise<ProgramActionResponse> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await (await supabase)
    .from("programs")
    .update(formData)
    .eq("id", programId)
    .select(`*, categories(*)`)
    .single();

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/admin/programs");
  return {
    success: true,
    message: "Programa atualizado com sucesso.",
    program: data,
  };
}

export async function deleteProgram(
  programId: string
): Promise<Omit<ProgramActionResponse, "program">> {
  const supabase = createSupabaseServerClient();
  const { error } = await (await supabase)
    .from("programs")
    .delete()
    .eq("id", programId);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/admin/programs");
  return { success: true, message: "Programa deletado com sucesso." };
}
export async function listProgramsAction({
  page,
  perPage,
}: {
  page: number;
  perPage: number;
}) {
  try {
    const { data, count } = await getProgramsWithRelations(page, perPage);
    return { success: true, data, count };
  } catch (error: any) {
    console.error("Server Action error listing programs:", error);
    return { success: false, error: "Falha ao listar programas." };
  }
}
export async function getAllPrograms() {
  "use server";
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("programs")
    .select("*")
    .order("title", { ascending: true });

  if (error) {
    console.error("Error fetching all programs:", error);
    return [];
  }
  return data;
}
