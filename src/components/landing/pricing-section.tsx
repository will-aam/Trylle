"use client";

import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/src/components/ui/toggle-group";
import { Check, Star } from "lucide-react";
import { useState } from "react";

export function PricingSection() {
  const [plan, setPlan] = useState("monthly");

  const pricingPlan = {
    id: "premium",
    name: "Plano Premium",
    description: "Acesso completo a todos os recursos",
    monthlyPrice: 9.9,
    yearlyPrice: 99,
    yearlyDiscount: 17,
    features: [
      "Downloads offline",
      "Acesso antecipado a novos episódios",
      "Estatísticas de escuta",
      "Acesso a todos os podcasts",
      "Streaming de alta qualidade",
      "Histórico de reprodução",
    ],
    popular: true,
    icon: <Star className="h-4 w-4" />,
  };

  const formatPrice = (monthlyPrice: number, yearlyPrice: number) => {
    if (plan === "monthly") {
      return `R$${monthlyPrice.toFixed(2).replace(".", ",")}/mês`;
    } else {
      const monthlyEquivalent = yearlyPrice / 12;
      return (
        <div className="space-y-1">
          <div className="text-2xl font-bold">
            R${monthlyEquivalent.toFixed(2).replace(".", ",")}/mês
          </div>
          <div className="text-sm text-muted-foreground">
            cobrado como R${yearlyPrice.toFixed(2).replace(".", ",")}/ano
          </div>
        </div>
      );
    }
  };

  return (
    <section className="py-16 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Escolha o melhor plano para você
          </h2>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed">
            Acesso ilimitado aos melhores podcasts. Cancele a qualquer momento,
            sem compromisso.
          </p>
        </div>

        <div className="mt-12 flex justify-center">
          <div className="relative">
            <ToggleGroup
              type="single"
              value={plan}
              onValueChange={(value) => {
                if (value) setPlan(value);
              }}
              defaultValue="monthly"
              className="inline-flex p-1 bg-muted rounded-lg"
            >
              <ToggleGroupItem
                value="monthly"
                className="px-6 py-3 text-sm font-medium rounded-md data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm transition-all"
              >
                Mensal
              </ToggleGroupItem>
              <ToggleGroupItem
                value="yearly"
                className="px-6 py-3 text-sm font-medium rounded-md data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm transition-all relative"
              >
                Anual
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        <div className="mt-16 flex justify-center">
          <div className="w-full max-w-md">
            <Card className="relative transition-all duration-300 hover:shadow-lg border-primary shadow-lg">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-4 py-1 text-sm font-medium">
                  Mais Popular
                </Badge>
              </div>

              <CardHeader className="text-center pb-8 pt-8">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {pricingPlan.icon}
                  <CardTitle className="text-xl sm:text-2xl font-bold">
                    {pricingPlan.name}
                  </CardTitle>
                </div>
                <CardDescription className="text-base text-muted-foreground mb-4">
                  {pricingPlan.description}
                </CardDescription>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-foreground">
                    {formatPrice(
                      pricingPlan.monthlyPrice,
                      pricingPlan.yearlyPrice
                    )}
                  </div>
                  {plan === "yearly" && (
                    <div className="mt-2">
                      <Badge variant="secondary" className="text-xs">
                        Economize {pricingPlan.yearlyDiscount}%
                      </Badge>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="px-6 pb-8">
                <ul className="space-y-4">
                  {pricingPlan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm sm:text-base text-foreground leading-relaxed">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="px-6 pb-8">
                <a href="/login">
                  <Button className="w-full py-3 text-base font-medium transition-all duration-200 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg">
                    Começar Agora
                  </Button>
                </a>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
