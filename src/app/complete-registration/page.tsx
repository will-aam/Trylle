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

  if (!email) {
    return (
      <div className="text-center text-destructive">
        <p>E-mail não encontrado.</p>
        <p>Por favor, volte e use o link que enviamos para você.</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }
    if (password.length < 6) {
      toast.error("Sua senha deve ter no mínimo 6 caracteres.");
      return;
    }
    setIsLoading(true);

    // Na próxima etapa, faremos a chamada à API aqui
    toast.info("Funcionalidade de API ainda não implementada.");
    console.log(`Email: ${email}, Senha: ${password}`);

    // Simulação de chamada de API
    setTimeout(() => {
      router.push("/"); // ALTERADO DE '/login' PARA '/'
    }, 2000);
    // Lógica futura de sucesso:
    // toast.success("Cadastro finalizado com sucesso!");
    // router.push("/login");
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
              {isLoading ? "Finalizando..." : "Criar Conta"}
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
    <Suspense fallback={<div>Carregando...</div>}>
      <CompleteRegistrationForm />
    </Suspense>
  );
}
