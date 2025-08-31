"use client";

import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-react";
import { createClient } from "@/src/lib/supabase-client"; // Importa nosso novo cliente
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/src/components/ui/card";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        // Se o login for bem-sucedido, redireciona para o painel de admin
        router.push("/admin");
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Acesso Restrito</CardTitle>
          <CardDescription>
            Entre com suas credenciais de administrador
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            theme="dark"
            providers={[]} // Deixamos vazio para não mostrar login com Google, etc.
            localization={{
              variables: {
                sign_in: {
                  email_label: "Seu email",
                  password_label: "Sua senha",
                  button_label: "Entrar",
                  loading_button_label: "Entrando...",
                },
              },
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
