"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import {
  Crown,
  Download,
  Zap,
  BarChart3,
  Clock,
  Headphones,
  History,
  FileText,
} from "lucide-react";

export function PremiumPlans() {
  const [isAnnual, setIsAnnual] = useState(true);

  const features = [
    {
      icon: <Download className="w-5 h-5" />,
      text: "Downloads offline",
    },
    {
      icon: <Zap className="w-5 h-5" />,
      text: "Acesso antecipado a novos episódios",
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      text: "Estatísticas de escuta",
    },
    {
      icon: <Headphones className="w-5 h-5" />,
      text: "Acesso a todos os podcasts",
    },
    {
      icon: <Clock className="w-5 h-5" />,
      text: "Streaming de alta qualidade",
    },
    {
      icon: <History className="w-5 h-5" />,
      text: "Histórico de reprodução",
    },
    {
      icon: <FileText className="w-5 h-5" />,
      text: "Downloads de documentos de apoio",
    },
  ];

  const monthlyPrice = 9.9;
  const annualPrice = 99.96;
  const annualMonthlyEquivalent = annualPrice / 12;

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Escolha o melhor plano para você
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Desbloqueie todo o potencial do Trylle com recursos exclusivos e
            conteúdo premium.
          </p>

          {/* Toggle Switch */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span
              className={`text-sm font-medium ${
                !isAnnual ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              Mensal
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300
                ${isAnnual ? "bg-primary" : "bg-muted-foreground/30"}
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300
                  ${isAnnual ? "translate-x-6" : "translate-x-1"}
                `}
              />
            </button>
            <span
              className={`text-sm font-medium ${
                isAnnual ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              Anual
            </span>
            {isAnnual && (
              <Badge className="ml-2 bg-green-500 hover:bg-green-600">
                6 meses grátis
              </Badge>
            )}
          </div>
        </div>

        <div className="flex justify-center">
          <Card className="w-full max-w-md shadow-2xl border-primary/30 bg-gradient-to-br from-card to-primary/5 relative overflow-hidden">
            {/* Premium Badge */}
            <div className="absolute top-4 right-4">
              <Badge className="bg-gradient-to-r from-primary to-secondary text-white gap-1">
                <Crown className="w-3 h-3" />
                Premium
              </Badge>
            </div>

            {/* Special Offer Badge
            {isAnnual && (
              <div className="absolute top-4 left-4">
                <Badge className="bg-green-500 hover:bg-green-600 text-white">
                  6 meses grátis
                </Badge>
              </div>
            )} */}

            <CardHeader className="text-center pb-4 pt-12">
              <CardTitle className="text-2xl font-bold">
                Plano Premium
              </CardTitle>
              <div className="space-y-2">
                <div className="text-4xl font-bold text-primary">
                  R${" "}
                  {isAnnual
                    ? annualMonthlyEquivalent.toFixed(2)
                    : monthlyPrice.toFixed(2)}
                  <span className="text-lg font-normal text-muted-foreground">
                    /mês
                  </span>
                </div>
                {isAnnual && (
                  <p className="text-sm text-muted-foreground">
                    Cobrado anualmente R$ {annualPrice.toFixed(2)}
                  </p>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Features List */}
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <div className="text-primary">{feature.icon}</div>
                    </div>
                    <span className="text-sm font-medium">{feature.text}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <Button size="lg" className="w-full text-lg py-6 gap-2">
                <Crown className="w-5 h-5" />
                Começar Premium
              </Button>

              {/* Additional Info
              <div className="text-center space-y-2">
                <p className="text-xs text-muted-foreground">Cancele a qualquer momento</p>
                <p className="text-xs text-muted-foreground">Teste grátis por 7 dias</p>
              </div> */}
            </CardContent>

            {/* Decorative Elements */}
            <div className="absolute -top-10 -right-10 w-20 h-20 bg-primary/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-10 -left-10 w-16 h-16 bg-secondary/10 rounded-full blur-xl"></div>
          </Card>
        </div>

        {/* Additional Benefits */}
        <div className="text-center mt-12 space-y-4">
          <h3 className="text-xl font-semibold">Por que escolher o Premium?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <Download className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-medium">Ouça Offline</h4>
              <p className="text-sm text-muted-foreground">
                Baixe seus episódios favoritos e ouça sem internet
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-medium">Acesso Antecipado</h4>
              <p className="text-sm text-muted-foreground">
                Seja o primeiro a ouvir novos episódios
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-medium">Estatísticas</h4>
              <p className="text-sm text-muted-foreground">
                Acompanhe seus hábitos de escuta
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
