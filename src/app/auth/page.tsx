"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
// REMOVA a importação antiga
// import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
// ADICIONE a importação da nossa nova função
import { createSupabaseBrowserClient } from "@/src/lib/supabase-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useTheme } from "next-themes";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import ParticleBackground from "@/src/components/ui/particle-background";
import { GoogleIcon } from "@/src/components/ui/google-icon";

// Esquemas de validação (sem alteração aqui)
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
  // CRIE O CLIENTE SUPABASE USANDO A NOVA FUNÇÃO
  const supabase = createSupabaseBrowserClient();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const originalTheme = theme;
    setTheme("dark");
    return () => {
      setTheme(originalTheme || "dark");
    };
  }, [setTheme, theme]);

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

  // A função de login que você já tinha está perfeita e vai funcionar agora.
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
      console.log("Dados do usuário:", signInData.user);

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

  // Nenhuma alteração necessária nas outras funções
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
        "Cadastro realizado! Por favor, verifique seu e-mail para confirmar a conta."
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
      },
    });
  };

  // O seu JSX permanece exatamente o mesmo.
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#021027]">
      <div className="absolute inset-0 z-0">
        <ParticleBackground />
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-900/80 border-slate-800 backdrop-blur-sm">
              <TabsTrigger
                value="login"
                className="data-[state=active]:bg-slate-800 data-[state=active]:text-slate-50 text-slate-400"
              >
                Conecte-se
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="data-[state=active]:bg-slate-800 data-[state=active]:text-slate-50 text-slate-400"
              >
                Inscrever-se
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card className="bg-slate-950/80 border-slate-800 shadow-2xl backdrop-blur-sm">
                <CardHeader className="space-y-1 pb-6">
                  <CardTitle className="text-2xl font-semibold text-slate-50">
                    Que bom ver você de novo!
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Entre na sua conta para continuar
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form
                    onSubmit={loginForm.handleSubmit(handleLogin)}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label
                        htmlFor="login-email"
                        className="text-slate-200 text-sm font-medium"
                      >
                        Email
                      </Label>
                      <Input
                        id="login-email"
                        placeholder="nome@exemplo.com"
                        type="email"
                        className="bg-slate-900 border-slate-700 text-slate-50 placeholder:text-slate-500 focus:border-slate-600 focus:ring-slate-600"
                        {...loginForm.register("email")}
                      />
                      {loginForm.formState.errors.email && (
                        <p className="text-xs text-red-400">
                          {loginForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="login-password"
                        className="text-slate-200 text-sm font-medium"
                      >
                        Senha
                      </Label>
                      <Input
                        id="login-password"
                        type="password"
                        className="bg-slate-900 border-slate-700 text-slate-50 placeholder:text-slate-500 focus:border-slate-600 focus:ring-slate-600"
                        {...loginForm.register("password")}
                      />
                      {loginForm.formState.errors.password && (
                        <p className="text-xs text-red-400">
                          {loginForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>
                    <Button
                      className="w-full bg-slate-50 text-slate-950 hover:bg-slate-200 font-medium"
                      type="submit"
                      disabled={isLoginLoading}
                    >
                      {isLoginLoading ? "Fazendo login..." : "Conecte-se"}
                    </Button>
                  </form>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-slate-700" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-slate-950 px-2 text-slate-500">
                        Ou continue com
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full bg-transparent border-slate-700 text-slate-200 hover:bg-slate-900 hover:text-white"
                    onClick={handleGoogleLogin}
                    disabled={isGoogleLoading}
                  >
                    <GoogleIcon className="mr-2 h-4 w-4" />
                    {isGoogleLoading
                      ? "Redirecionando..."
                      : "Entrar com o Google"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="signup">
              <Card className="bg-slate-950/80 border-slate-800 shadow-2xl backdrop-blur-sm">
                <CardHeader className="space-y-1 pb-6">
                  <CardTitle className="text-2xl font-semibold text-slate-50">
                    Criar uma conta
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Insira suas informações para começar
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form
                    onSubmit={signupForm.handleSubmit(handleSignUp)}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label
                        htmlFor="signup-email"
                        className="text-slate-200 text-sm font-medium"
                      >
                        Email
                      </Label>
                      <Input
                        id="signup-email"
                        placeholder="nome@exemplo.com"
                        type="email"
                        className="bg-slate-900 border-slate-700 text-slate-50 placeholder:text-slate-500 focus:border-slate-600 focus:ring-slate-600"
                        {...signupForm.register("email")}
                      />
                      {signupForm.formState.errors.email && (
                        <p className="text-xs text-red-400">
                          {signupForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="signup-password"
                        className="text-slate-200 text-sm font-medium"
                      >
                        Senha
                      </Label>
                      <Input
                        id="signup-password"
                        type="password"
                        className="bg-slate-900 border-slate-700 text-slate-50 placeholder:text-slate-500 focus:border-slate-600 focus:ring-slate-600"
                        {...signupForm.register("password")}
                      />
                      {signupForm.formState.errors.password && (
                        <p className="text-xs text-red-400">
                          {signupForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>
                    <Button
                      className="w-full bg-slate-50 text-slate-950 hover:bg-slate-200 font-medium"
                      type="submit"
                      disabled={isSignupLoading}
                    >
                      {isSignupLoading ? "Criando conta..." : "Criar uma conta"}
                    </Button>
                  </form>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-slate-700" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-slate-950 px-2 text-slate-500">
                        Ou inscreva-se com
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full bg-transparent border-slate-700 text-slate-200 hover:bg-slate-900 hover:text-white"
                    onClick={handleGoogleLogin}
                    disabled={isGoogleLoading}
                  >
                    <GoogleIcon className="mr-2 h-4 w-4" />
                    {isGoogleLoading
                      ? "Redirecionando..."
                      : "Cadastre-se com o Google"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {error && (
              <p className="mt-4 text-center text-sm text-red-400 bg-red-950/50 border border-red-800/50 rounded-lg p-3 backdrop-blur-sm">
                {error}
              </p>
            )}
            {message && (
              <p className="mt-4 text-center text-sm text-green-400 bg-green-950/50 border border-green-800/50 rounded-lg p-3 backdrop-blur-sm">
                {message}
              </p>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
