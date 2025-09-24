// src/app/api/signup/route.ts

import { createClient } from "@supabase/supabase-js";
// A CORREÇÃO PRINCIPAL ESTÁ AQUI:
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";

const signupSchema = z.object({
  email: z.string().email({ message: "Por favor, insira um e-mail válido." }),
  password: z
    .string()
    .min(6, { message: "A senha deve ter no mínimo 6 caracteres." }),
});

export async function POST(request: Request) {
  const cookieStore = await cookies();

  // --- CORREÇÃO APLICADA AQUI ---
  // Trocamos createRouteHandlerClient por createServerClient
  // e passamos a configuração completa.
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
    const validationResult = signupSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;

    const { data: lead } = await supabaseAdmin
      .from("leads")
      .select("status")
      .eq("email", email)
      .single();

    if (lead && lead.status === "interessado") {
      const { error: adminCreateError } =
        await supabaseAdmin.auth.admin.createUser({
          email: email,
          password: password,
          email_confirm: true,
        });

      if (adminCreateError) throw adminCreateError;

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      await supabaseAdmin
        .from("leads")
        .update({ status: "convertido" })
        .eq("email", email);

      return NextResponse.json({
        message: "Usuário convertido com sucesso e logado!",
        requiresEmailVerification: false,
      });
    } else {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          // Adicione a URL de redirecionamento para o seu app aqui
          emailRedirectTo: `${new URL(request.url).origin}/auth/callback`,
        },
      });

      if (error) throw error;

      return NextResponse.json({
        message: "Cadastro realizado! Por favor, verifique seu e-mail.",
        requiresEmailVerification: true,
      });
    }
  } catch (error: any) {
    console.error("Erro na API de cadastro unificado:", error);
    if (error.message.includes("User already registered")) {
      return NextResponse.json(
        { error: "Este e-mail já está cadastrado. Tente fazer o login." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Não foi possível realizar o cadastro." },
      { status: 500 }
    );
  }
}
