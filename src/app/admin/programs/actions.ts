"use server";

import { revalidatePath } from "next/cache";
import { getProgramsWithRelations } from "@/src/services/programService";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Program } from "@/src/lib/types";
import { z } from "zod";

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

// Schema para validação dos dados do programa
const programActionSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, "O título precisa ter pelo menos 3 caracteres."),
  description: z
    .string()
    .min(10, "A descrição precisa ter pelo menos 10 caracteres."),
  category_id: z.string().min(1, "A categoria é obrigatória."),
  image_url: z.string().nullable().optional(),
});

// Tipo atualizado para incluir o campo image_url
type ProgramFormData = z.infer<typeof programActionSchema>;

export async function createProgram(
  formData: ProgramFormData
): Promise<ProgramActionResponse> {
  const supabase = createSupabaseServerClient();

  // Validação dos dados
  const validation = programActionSchema.omit({ id: true }).safeParse(formData);

  if (!validation.success) {
    return {
      success: false,
      message:
        "Dados inválidos: " +
        validation.error.errors.map((e) => e.message).join(", "),
    };
  }

  const { data, error } = await (await supabase)
    .from("programs")
    .insert(validation.data)
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

  // Validação dos dados
  const validation = programActionSchema.omit({ id: true }).safeParse(formData);

  if (!validation.success) {
    return {
      success: false,
      message:
        "Dados inválidos: " +
        validation.error.errors.map((e) => e.message).join(", "),
    };
  }

  const { data, error } = await (
    await supabase
  )
    .from("programs")
    .update({
      ...validation.data,
      updated_at: new Date().toISOString(),
    })
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

// Função unificada saveProgram para ser usada pelo ProgramForm
export async function saveProgram(
  formData: ProgramFormData
): Promise<ProgramActionResponse> {
  if (formData.id) {
    return updateProgram(formData.id, formData);
  } else {
    return createProgram(formData);
  }
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
