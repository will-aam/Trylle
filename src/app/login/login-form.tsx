"use client";

import { createClient } from "@/src/lib/supabase-client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";

export function LoginForm() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        const userRole = session.user?.user_metadata?.role;
        if (userRole === "admin") {
          router.push("/admin");
        } else {
          router.push(next);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, router, next]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : "Ocorreu um erro desconhecido"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${next}`,
        },
      });
      if (error) throw error;
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : "Ocorreu um erro desconhecido"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <div className="w-full max-w-md mx-4">
        <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="w-full space-y-8">
            {/* O resto do seu conteúdo permanece exatamente igual */}
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold">Bem-vindo(a) de volta!</h1>
              <p className="text-muted-foreground">
                Acesse sua conta para continuar
              </p>
            </div>

            <div className="space-y-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Seu e-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Sua senha</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                {error && (
                  <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Entrando..." : "Entrar com e-mail"}
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
                className="w-full transition-all duration-200 hover:shadow-md border-slate-300 hover:border-slate-400 bg-transparent"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115z"
                  />
                  <path
                    fill="#34A853"
                    d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987z"
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
                Entrar com Gmail
              </Button>
            </div>

            <div className="mt-4 text-center text-sm">
              Não tem uma conta?{" "}
              <Link href="/signup" className="underline font-semibold">
                Cadastre-se aqui
              </Link>
            </div>
          </div>
        </div>

        {/* <div className="hidden lg:block">
        <Image
          src="/public/banner.jpg"
          alt="Imagem de fundo da página de login"
          width="1920"
          height="1080"
          className="h-full w-full object-cover dark:brightness-[0.2]"
        />
      </div> */}
      </div>
    </div>
  );
}
