"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/src/components/ui/chart";
import { Pie, PieChart } from "recharts";

const chartData = [
  { plan: "Mensal", users: 400, fill: "var(--color-monthly)" },
  { plan: "Anual", users: 100, fill: "var(--color-yearly)" },
];

const chartConfig = {
  users: {
    label: "Usuários",
  },
  monthly: {
    label: "Mensal",
    color: "#3b82f6",
  },
  yearly: {
    label: "Anual",
    color: "#16a34a",
  },
};

export function PlanDistribution() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuição de Planos</CardTitle>
        <CardDescription>
          Proporção de assinantes por tipo de plano
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-48"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey="users" />} />
            <Pie data={chartData} dataKey="users" nameKey="plan" />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
