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
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

const chartData = [
  { month: "Out", revenue: 1860 },
  { month: "Nov", revenue: 2050 },
  { month: "Dez", revenue: 2390 },
  { month: "Jan", revenue: 3490 },
  { month: "Fev", revenue: 4200 },
  { month: "Mar", revenue: 4950 },
];

const chartConfig = {
  revenue: {
    label: "Receita",
    color: "#2563eb",
  },
};

export function RevenueChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Crescimento da Receita</CardTitle>
        <CardDescription>Receita mensal dos últimos 6 meses</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-80">
          <BarChart data={chartData} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
