"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
        // ADICIONE ESTA PARTE PARA FORÇAR A SELEÇÃO DE CONTA
        queryParams: {
          prompt: "select_account",
        },
      },
    });
  };

  // O seu JSX permanece exatamente o mesmo.
  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      <div className="absolute inset-0 z-0">
        <ParticleBackground />
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted/80 border-border backdrop-blur-sm">
              <TabsTrigger
                value="login"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground"
              >
                Conecte-se
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground"
              >
                Inscrever-se
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card className="bg-card/80 border-border shadow-2xl backdrop-blur-sm">
                <CardHeader className="space-y-1 pb-6">
                  <CardTitle className="text-2xl font-semibold text-foreground">
                    Que bom ver você de novo!
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
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
                        className="text-foreground text-sm font-medium"
                      >
                        Email
                      </Label>
                      <Input
                        id="login-email"
                        placeholder="nome@exemplo.com"
                        type="email"
                        className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
                        {...loginForm.register("email")}
                      />
                      {loginForm.formState.errors.email && (
                        <p className="text-xs text-destructive">
                          {loginForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="login-password"
                        className="text-foreground text-sm font-medium"
                      >
                        Senha
                      </Label>
                      <Input
                        id="login-password"
                        type="password"
                        className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
                        {...loginForm.register("password")}
                      />
                      {loginForm.formState.errors.password && (
                        <p className="text-xs text-destructive">
                          {loginForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>
                    <Button
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
                      type="submit"
                      disabled={isLoginLoading}
                    >
                      {isLoginLoading ? "Fazendo login..." : "Conecte-se"}
                    </Button>
                  </form>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">
                        Ou continue com
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full bg-transparent border-border text-foreground hover:bg-muted hover:text-foreground"
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
              <Card className="bg-card/80 border-border shadow-2xl backdrop-blur-sm">
                <CardHeader className="space-y-1 pb-6">
                  <CardTitle className="text-2xl font-semibold text-foreground">
                    Criar uma conta
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
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
                        className="text-foreground text-sm font-medium"
                      >
                        Email
                      </Label>
                      <Input
                        id="signup-email"
                        placeholder="nome@exemplo.com"
                        type="email"
                        className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
                        {...signupForm.register("email")}
                      />
                      {signupForm.formState.errors.email && (
                        <p className="text-xs text-destructive">
                          {signupForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="signup-password"
                        className="text-foreground text-sm font-medium"
                      >
                        Senha
                      </Label>
                      <Input
                        id="signup-password"
                        type="password"
                        className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
                        {...signupForm.register("password")}
                      />
                      {signupForm.formState.errors.password && (
                        <p className="text-xs text-destructive">
                          {signupForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>
                    <Button
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
                      type="submit"
                      disabled={isSignupLoading}
                    >
                      {isSignupLoading ? "Criando conta..." : "Criar uma conta"}
                    </Button>
                  </form>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">
                        Ou inscreva-se com
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full bg-transparent border-border text-foreground hover:bg-muted hover:text-foreground"
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
              <p className="mt-4 text-center text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3 backdrop-blur-sm">
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
