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
import { Check } from "lucide-react";
import { useState } from "react";

export function PricingSection() {
  const [plan, setPlan] = useState("monthly");

  return (
    <section className="py-12 sm:py-16">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Escolha o melhor plano para você
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Acesso ilimitado. Cancele quando quiser.
          </p>
        </div>
        <div className="mt-8 flex justify-center">
          <ToggleGroup
            type="single"
            value={plan}
            onValueChange={(value) => {
              if (value) setPlan(value);
            }}
            defaultValue="monthly"
            className="inline-flex"
          >
            <ToggleGroupItem
              value="monthly"
              className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground bg-muted/20"
            >
              Mensal
            </ToggleGroupItem>
            <ToggleGroupItem
              value="yearly"
              className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground bg-muted/20"
            >
              Anual
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-muted/40">
            <CardHeader>
              <CardTitle>Plano Padrão</CardTitle>
              <CardDescription>
                {plan === "monthly" ? "R$9,90/mês" : "R$99/ano"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  Acesso a todos os podcasts
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  Streaming pela internet
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-primary">Escolha esse Plano</Button>
            </CardFooter>
          </Card>
          <Card className="border-primary bg-muted/40">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Parcelado Anual</CardTitle>
                <Badge variant="default">Economize 16%</Badge>
              </div>
              <CardDescription>
                R$12,40/mês
                <span className="block text-xs text-muted-foreground">
                  cobrado como R$149,00/ano
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  Acesso a todos os podcasts
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  Streaming pela internet
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  Ouça offline (baixe na plataforma)
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="default">
                Escolha esse Plano
              </Button>
            </CardFooter>
          </Card>
          <Card className="bg-muted/40">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Plano Premium</CardTitle>
              </div>
              <CardDescription>
                {plan === "monthly" ? "R$14,90/mês" : "R$149/ano"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  Acesso a todos os podcasts
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  Streaming pela internet
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  Ouça offline (baixe na plataforma)
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-primary">Escolha esse Plano</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
}
