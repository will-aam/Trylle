"use client";

import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";

// Componente Wrapper para usar Suspense, necessário para useSearchParams
function CompleteRegistrationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Se o e-mail não estiver na URL, mostra uma mensagem de erro.
  if (!email) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-destructive">Erro</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Parâmetro de e-mail ausente.</p>
            <p className="text-muted-foreground text-sm mt-2">
              Por favor, use o link que enviamos para o seu e-mail.
            </p>
            <Button onClick={() => router.push("/")} className="mt-4">
              Voltar para a Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validações no frontend
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }
    if (password.length < 6) {
      toast.error("Sua senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/complete-registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Ocorreu um erro desconhecido.");
      }

      // Sucesso!
      toast.success("Cadastro finalizado com sucesso!", {
        description: "Bem-vindo(a) ao Trylle! Redirecionando...",
      });

      // Redireciona o usuário para a página principal (logada)
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error: any) {
      toast.error("Erro ao finalizar cadastro", {
        description: error.message,
      });
      setIsLoading(false);
    }
    // Não definimos isLoading como false no sucesso, pois a página será redirecionada
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Finalize seu Cadastro</CardTitle>
          <CardDescription>
            Você está a um passo de acessar o Trylle. Crie uma senha para o
            e-mail: <strong>{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar Senha</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Finalizando..." : "Criar Conta e Acessar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente principal da página que usa o Wrapper com Suspense
export default function CompleteRegistrationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          Carregando...
        </div>
      }
    >
      <CompleteRegistrationForm />
    </Suspense>
  );
}
