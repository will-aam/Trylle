"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { toast } from "@/src/lib/safe-toast"; // 1. Mude a importação para "sonner"
import { Gift, Mail } from "lucide-react";

export function FinalCTASection() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      // 3. Use o toast.error do Sonner
      toast.error("Ops!", {
        description: "Você esqueceu de digitar seu e-mail.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Falha ao registrar o e-mail.");
      }

      // 4. Use o toast.success do Sonner, ele já é verde!
      toast.success("Inscrição recebida!", {
        description:
          "Seu e-mail foi salvo com sucesso. Fique de olho na sua caixa de entrada!",
      });
      setEmail("");
    } catch (error: any) {
      // 5. Use o toast.error do Sonner para outros erros
      toast.error("Erro", {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section
      id="jornada"
      className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/10 via-background to-secondary/10 scroll-mt-14"
    >
      <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
        <div className="space-y-3 sm:space-y-4">
          <Gift className="w-10 h-10 sm:w-12 sm:h-12 text-primary mx-auto" />
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Garanta seu Acesso Gratuito à Jornada
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
            Seja um dos primeiros a explorar o Trylle. Deixe seu e-mail e nós
            avisaremos assim que a plataforma estiver no ar.
          </p>
        </div>

        <div className="max-w-md mx-auto space-y-3 sm:space-y-4">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-2 sm:gap-2"
          >
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Seu melhor e-mail"
                className="pl-10 h-11 sm:h-12"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="px-4 sm:px-6 h-11 sm:h-12 w-full sm:w-auto"
              disabled={isLoading}
            >
              {isLoading ? "Enviando..." : "Garantir Acesso Gratuito"}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground px-2 sm:px-0">
            Prometemos não enviar spam. Apenas o aviso de lançamento.
          </p>
        </div>
      </div>
    </section>
  );
}
