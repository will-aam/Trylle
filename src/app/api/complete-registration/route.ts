import { createClient } from "@supabase/supabase-js";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";

const registrationSchema = z.object({
  email: z.string().email({ message: "E-mail inválido." }),
  password: z
    .string()
    .min(6, { message: "A senha precisa ter no mínimo 6 caracteres." }),
});

export async function POST(request: Request) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: "", ...options });
        },
      },
    }
  );

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const body = await request.json();
    const validationResult = registrationSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;

    const { data: lead, error: leadError } = await supabaseAdmin
      .from("leads")
      .select("id, status")
      .eq("email", email)
      .single();

    if (leadError || !lead) {
      return NextResponse.json(
        { error: "Este e-mail não está na nossa lista de acesso antecipado." },
        { status: 404 }
      );
    }

    if (lead.status === "convertido") {
      return NextResponse.json(
        { error: "Este e-mail já finalizou o cadastro. Tente fazer o login." },
        { status: 409 }
      );
    }

    const { error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
    });

    if (authError) {
      if (authError.message.includes("User already registered")) {
        return NextResponse.json(
          {
            error: "Um usuário com este e-mail já existe. Tente fazer o login.",
          },
          { status: 409 }
        );
      }
      throw authError;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      throw signInError;
    }

    const { error: updateError } = await supabaseAdmin
      .from("leads")
      .update({ status: "convertido" })
      .eq("email", email);

    if (updateError) {
      console.error(
        `Falha ao atualizar status do lead para ${email}:`,
        updateError.message
      );
    }

    return NextResponse.json(
      { message: "Usuário criado e logado com sucesso!" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Erro na finalização de cadastro:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro no servidor. Tente novamente mais tarde." },
      { status: 500 }
    );
  }
}
