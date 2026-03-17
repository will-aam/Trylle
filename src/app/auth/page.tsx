// src/app/auth/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/src/lib/supabase-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import { GoogleIcon } from "@/src/components/ui/google-icon";

const loginSchema = z.object({
  email: z.string().email({ message: "Por favor, insira um e-mail válido." }),
  password: z.string().min(1, { message: "A senha é obrigatória." }),
});

const signupSchema = z.object({
  email: z.string().email({ message: "Por favor, insira um e-mail válido." }),
  password: z
    .string()
    .min(6, { message: "A senha deve ter no mínimo 6 caracteres." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

export default function AuthPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isSignupLoading, setIsSignupLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: "", password: "" },
  });

  const handleLogin = async (data: LoginFormValues) => {
    setIsLoginLoading(true);
    setError(null);
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

    if (signInError) {
      console.error("Erro no login:", signInError.message);
      setError("Credenciais inválidas. Verifique seu e-mail e senha.");
      setIsLoginLoading(false);
      return;
    }

    if (signInData.user) {
      if (signInData.user.user_metadata?.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
      router.refresh();
    } else {
      setError("Ocorreu um erro ao fazer login. Tente novamente.");
    }

    setIsLoginLoading(false);
  };

  const handleSignUp = async (data: SignupFormValues) => {
    setIsSignupLoading(true);
    setError(null);
    setMessage(null);
    const response = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error || "Não foi possível realizar o cadastro.");
    } else {
      setMessage(
        "Cadastro realizado! Por favor, verifique seu e-mail para confirmar a conta.",
      );
      signupForm.reset();
    }
    setIsSignupLoading(false);
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
        queryParams: {
          prompt: "select_account",
        },
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          {/* Você pode adicionar sua Logo aqui no lugar deste h1 se quiser */}
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Trylle
          </h1>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/50">
            <TabsTrigger value="login">Conecte-se</TabsTrigger>
            <TabsTrigger value="signup">Inscrever-se</TabsTrigger>
          </TabsList>

          <TabsContent
            value="login"
            className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300"
          >
            <form
              onSubmit={loginForm.handleSubmit(handleLogin)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  placeholder="nome@exemplo.com"
                  type="email"
                  className="bg-transparent"
                  {...loginForm.register("email")}
                />
                {loginForm.formState.errors.email && (
                  <p className="text-xs text-destructive">
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Senha</Label>
                <Input
                  id="login-password"
                  type="password"
                  className="bg-transparent"
                  {...loginForm.register("password")}
                />
                {loginForm.formState.errors.password && (
                  <p className="text-xs text-destructive">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              <Button
                className="w-full"
                type="submit"
                disabled={isLoginLoading}
              >
                {isLoginLoading ? "Fazendo login..." : "Entrar"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent
            value="signup"
            className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300"
          >
            <form
              onSubmit={signupForm.handleSubmit(handleSignUp)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  placeholder="nome@exemplo.com"
                  type="email"
                  className="bg-transparent"
                  {...signupForm.register("email")}
                />
                {signupForm.formState.errors.email && (
                  <p className="text-xs text-destructive">
                    {signupForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Senha</Label>
                <Input
                  id="signup-password"
                  type="password"
                  className="bg-transparent"
                  {...signupForm.register("password")}
                />
                {signupForm.formState.errors.password && (
                  <p className="text-xs text-destructive">
                    {signupForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              <Button
                className="w-full"
                type="submit"
                disabled={isSignupLoading}
              >
                {isSignupLoading ? "Criando conta..." : "Criar conta"}
              </Button>
            </form>
          </TabsContent>

          <div className="mt-6 space-y-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Ou continue com
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              type="button"
              className="w-full bg-transparent"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
            >
              <GoogleIcon className="mr-2 h-4 w-4" />
              {isGoogleLoading ? "Redirecionando..." : "Google"}
            </Button>
          </div>

          {error && (
            <p className="mt-6 text-center text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
              {error}
            </p>
          )}
          {message && (
            <p className="mt-6 text-center text-sm text-green-500 bg-green-500/10 border border-green-500/20 rounded-md p-3">
              {message}
            </p>
          )}
        </Tabs>
      </div>
    </div>
  );
}
