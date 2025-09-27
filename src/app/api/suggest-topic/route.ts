// Caminho: src/app/api/suggest-topic/route.ts

import { createRouteHandlerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

const suggestionSchema = z.object({
  title: z
    .string()
    .min(3, "O título deve ter pelo menos 3 caracteres.")
    .max(150, "O título é muito longo."),
  description: z
    .string()
    .min(10, "A descrição deve ter pelo menos 10 caracteres."),
  category: z.string().min(1, "A categoria é obrigatória."),
  email: z
    .string()
    .email("Por favor, insira um e-mail válido.")
    .optional()
    .or(z.literal("")),
});

export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    const body = await request.json();
    const validationResult = suggestionSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { title, description, category, email } = validationResult.data;

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const { error } = await supabase.from("suggestions").insert({
      title,
      description,
      category,
      email: email || null,
      user_id: session?.user?.id || null,
    });

    if (error) {
      console.error("Erro do Supabase ao salvar sugestão:", error);
      throw error;
    }

    return NextResponse.json({ message: "Sugestão enviada com sucesso!" });
  } catch (error: any) {
    console.error("Erro na API de sugestões:", error);
    return NextResponse.json(
      { error: "Não foi possível processar sua sugestão." },
      { status: 500 }
    );
  }
}
