"use client";

import type React from "react";

import { createClient } from "@/src/lib/supabase-client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { MailCheck } from "lucide-react";

export default function SignupPage() {
  const supabase = createClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    setIsLoading(true);

    try {
      // 1. Gerar a URL do avatar do DiceBear
      const avatarSeed = encodeURIComponent(name.trim()); // Usa o nome do usuário como semente
      const avatarUrl = `https://api.dicebear.com/8.x/thumbs/svg?seed=${avatarSeed}`;

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // 2. Salvar o nome e a nova URL do avatar nos metadados do usuário
          data: {
            name: name.trim(),
            avatar_url: avatarUrl,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;

      setIsSubmitted(true);
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : "Ocorreu um erro no cadastro."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // NOVA FUNÇÃO: Cadastro com Google
  const handleGoogleSignup = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Ocorreu um erro");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // O evento SIGNED_IN ocorre após o callback do Google
      if (
        event === "SIGNED_IN" &&
        session?.user.app_metadata.provider === "google"
      ) {
        const user = session.user;
        // Verifica se o usuário do Google NÃO TEM um avatar_url
        if (user && !user.user_metadata.avatar_url) {
          const userName = user.user_metadata.name || user.email; // Usa o nome ou o e-mail como fallback
          const avatarSeed = encodeURIComponent(userName.trim());
          const avatarUrl = `https://api.dicebear.com/8.x/thumbs/svg?seed=${avatarSeed}`;

          // Atualiza o perfil do usuário com o novo avatar
          await supabase.auth.updateUser({
            data: { avatar_url: avatarUrl },
          });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="w-full space-y-6 sm:space-y-8">
          {isSubmitted ? (
            <div className="text-center space-y-4 p-6 sm:p-8 bg-muted/50 rounded-lg">
              <MailCheck className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-green-500" />
              <h1 className="text-xl sm:text-2xl font-bold">
                Confirme seu E-mail
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Enviamos um link de confirmação para o seu e-mail. Por favor,
                clique no link para ativar sua conta e fazer o login.
              </p>
              <Button
                asChild
                variant="outline"
                className="h-10 sm:h-11 bg-transparent"
              >
                <Link href="/login">Voltar para o Login</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="text-center space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold">
                  Crie sua Conta Grátis
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Comece a sua jornada em nossa plataforma
                </p>
              </div>

              <form onSubmit={handleSignup} className="space-y-3 sm:space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Seu Nome
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Como podemos te chamar?"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-10 sm:h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Seu Melhor E-mail
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10 sm:h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Crie uma Senha
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-10 sm:h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium"
                  >
                    Confirme sua Senha
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-10 sm:h-11"
                  />
                </div>
                {error && (
                  <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                    {error}
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full h-10 sm:h-11 text-sm sm:text-base"
                  disabled={isLoading}
                >
                  {isLoading ? "Criando conta..." : "Criar Minha Conta Grátis"}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Ou continue com
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full h-10 sm:h-11 text-sm sm:text-base bg-transparent"
                onClick={handleGoogleSignup}
                disabled={isLoading}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115z"
                  />
                  <path
                    fill="#34A853"
                    d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c0 1.92.445 3.73 1.237 5.335l4.04-3.067z"
                  />
                  <path
                    fill="#4A90E2"
                    d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067z"
                  />
                </svg>
                Cadastre-se com Google
              </Button>

              <div className="mt-4 text-center text-sm">
                Já tem uma conta?{" "}
                <Link
                  href="/login"
                  className="underline font-semibold hover:text-primary"
                >
                  Faça o login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
