import { supabase } from "@/src/lib/supabase";
import { NextResponse } from "next/server";
import { z } from "zod";

const emailSchema = z
  .string()
  .email({ message: "Por favor, insira um e-mail válido." });

export async function POST(request: Request) {
  let body;

  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json(
      { error: "Corpo da requisição inválido." },
      { status: 400 }
    );
  }

  const { email } = body;

  const validationResult = emailSchema.safeParse(email);
  if (!validationResult.success) {
    return NextResponse.json(
      { error: validationResult.error.errors[0].message },
      { status: 400 }
    );
  }

  const validatedEmail = validationResult.data;

  try {
    const { error } = await supabase
      .from("leads")
      .insert({ email: validatedEmail });

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Este e-mail já foi cadastrado." },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json(
      { message: "Inscrição realizada com sucesso!" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Erro ao inscrever e-mail:", error);
    return NextResponse.json(
      {
        error:
          "Não foi possível registrar seu e-mail. Tente novamente mais tarde.",
      },
      { status: 500 }
    );
  }
}
