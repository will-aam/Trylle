import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Gift, Mail } from "lucide-react";

export function FinalCTASection() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
        <div className="space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-2 sm:px-4 rounded-full text-xs sm:text-sm font-medium">
            <Gift className="w-3 h-3 sm:w-4 sm:h-4" />
            Oferta por tempo limitado
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-balance px-2 sm:px-0">
            Faça parte do começo desta jornada
          </h2>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed px-2 sm:px-4 md:px-0">
            O Trylle está em fase de lançamento e você pode ter{" "}
            <span className="font-semibold text-primary">
              acesso 100% gratuito
            </span>{" "}
            a todo o conteúdo. Sem pegadinhas, sem cartão de crédito. Apenas
            conhecimento de qualidade.
          </p>
        </div>

        <div className="max-w-md mx-auto space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Seu melhor e-mail"
                className="pl-10 h-11 sm:h-12"
              />
            </div>
            <Button
              size="lg"
              className="px-4 sm:px-6 h-11 sm:h-12 w-full sm:w-auto"
            >
              Garantir Acesso
            </Button>
          </div>

          <p className="text-xs text-muted-foreground px-2 sm:px-0">
            Prometemos não enviar spam. Apenas atualizações sobre novos
            episódios e o lançamento oficial.
          </p>
        </div>

        <div className="pt-6 sm:pt-8 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-center">
          <div>
            <div className="text-xl sm:text-2xl font-bold text-primary">
              100%
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              Gratuito
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-primary">0</div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              Anúncios
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-primary">
              10-20
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              Minutos
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-primary">∞</div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              Conhecimento
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
