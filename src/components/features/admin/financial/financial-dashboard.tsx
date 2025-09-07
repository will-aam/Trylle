"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Progress } from "@/src/components/ui/progress";
import { Badge } from "@/src/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  Users,
  DollarSign,
  UserMinus,
  Target,
  Calendar,
  User,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const monthlyData = [
  {
    month: "Jan",
    receita: 2850,
    novosAssinantes: 45,
    cancelamentos: 8,
    mrr: 2850,
    arr: 34200,
  },
  {
    month: "Fev",
    receita: 3120,
    novosAssinantes: 52,
    cancelamentos: 12,
    mrr: 3120,
    arr: 37440,
  },
  {
    month: "Mar",
    receita: 3380,
    novosAssinantes: 48,
    cancelamentos: 9,
    mrr: 3380,
    arr: 40560,
  },
  {
    month: "Abr",
    receita: 3650,
    novosAssinantes: 55,
    cancelamentos: 11,
    mrr: 3650,
    arr: 43800,
  },
  {
    month: "Mai",
    receita: 3920,
    novosAssinantes: 62,
    cancelamentos: 15,
    mrr: 3920,
    arr: 47040,
  },
  {
    month: "Jun",
    receita: 4180,
    novosAssinantes: 58,
    cancelamentos: 13,
    mrr: 4180,
    arr: 50160,
  },
  {
    month: "Jul",
    receita: 4450,
    novosAssinantes: 65,
    cancelamentos: 10,
    mrr: 4450,
    arr: 53400,
  },
  {
    month: "Ago",
    receita: 4720,
    novosAssinantes: 71,
    cancelamentos: 18,
    mrr: 4720,
    arr: 56640,
  },
  {
    month: "Set",
    receita: 4980,
    novosAssinantes: 68,
    cancelamentos: 14,
    mrr: 4980,
    arr: 59760,
  },
  {
    month: "Out",
    receita: 5250,
    novosAssinantes: 74,
    cancelamentos: 16,
    mrr: 5250,
    arr: 63000,
  },
  {
    month: "Nov",
    receita: 5520,
    novosAssinantes: 78,
    cancelamentos: 12,
    mrr: 5520,
    arr: 66240,
  },
  {
    month: "Dez",
    receita: 5800,
    novosAssinantes: 82,
    cancelamentos: 9,
    mrr: 5800,
    arr: 69600,
  },
];

const planData = [
  { name: "Starter", value: 145, color: "hsl(var(--chart-1))", price: 9.9 },
  {
    name: "Professional",
    value: 89,
    color: "hsl(var(--chart-2))",
    price: 29.9,
  },
  { name: "Enterprise", value: 34, color: "hsl(var(--chart-3))", price: 99.9 },
  { name: "Premium", value: 18, color: "hsl(var(--chart-4))", price: 199.9 },
];

const recentTransactions = [
  {
    date: "2024-12-15",
    user: "TechCorp Ltda",
    plan: "Enterprise",
    value: "R$ 199,90",
    type: "upgrade",
  },
  {
    date: "2024-12-15",
    user: "João Silva",
    plan: "Professional",
    value: "R$ 29,90",
    type: "new",
  },
  {
    date: "2024-12-14",
    user: "Maria Santos",
    plan: "Starter",
    value: "R$ 9,90",
    type: "renewal",
  },
  {
    date: "2024-12-14",
    user: "Inovação Digital",
    plan: "Premium",
    value: "R$ 199,90",
    type: "new",
  },
  {
    date: "2024-12-13",
    user: "Pedro Costa",
    plan: "Professional",
    value: "R$ 29,90",
    type: "upgrade",
  },
  {
    date: "2024-12-13",
    user: "Ana Oliveira",
    plan: "Enterprise",
    value: "R$ 99,90",
    type: "renewal",
  },
  {
    date: "2024-12-12",
    user: "Carlos Lima",
    plan: "Starter",
    value: "R$ 9,90",
    type: "new",
  },
  {
    date: "2024-12-12",
    user: "StartupXYZ",
    plan: "Professional",
    value: "R$ 29,90",
    type: "new",
  },
];

const advancedMetrics = [
  {
    metric: "LTV",
    value: 450,
    unit: "R$",
    change: 12.5,
    period: "vs mês anterior",
  },
  {
    metric: "CAC",
    value: 85,
    unit: "R$",
    change: -8.2,
    period: "vs mês anterior",
  },
  {
    metric: "LTV/CAC",
    value: 5.3,
    unit: "x",
    change: 15.8,
    period: "vs mês anterior",
  },
  {
    metric: "Payback",
    value: 2.8,
    unit: "meses",
    change: -12.1,
    period: "vs mês anterior",
  },
];

export function FinancialDashboard() {
  const [chartView, setChartView] = useState<
    "receita" | "assinantes" | "cancelamentos" | "mrr"
  >("receita");

  const currentMRR = 5800;
  const activeSubscribers = 286;
  const averageTicket = 20.28;
  const churnRate = 1.55;
  const monthlyGoal = 8000;
  const progress = (currentMRR / monthlyGoal) * 100;
  const annualProjection = currentMRR * 12;

  const getChartData = () => {
    switch (chartView) {
      case "assinantes":
        return monthlyData.map((d) => ({ ...d, value: d.novosAssinantes }));
      case "cancelamentos":
        return monthlyData.map((d) => ({ ...d, value: d.cancelamentos }));
      case "mrr":
        return monthlyData.map((d) => ({ ...d, value: d.mrr }));
      default:
        return monthlyData.map((d) => ({ ...d, value: d.receita }));
    }
  };

  const getChartColor = () => {
    switch (chartView) {
      case "assinantes":
        return "hsl(var(--chart-2))";
      case "cancelamentos":
        return "hsl(var(--destructive))";
      case "mrr":
        return "hsl(var(--chart-3))";
      default:
        return "hsl(var(--primary))";
    }
  };

  return (
    <div className="space-y-8">
      {/* Seção 1: KPIs Principais */}
      <section>
        <h2 className="text-2xl font-semibold mb-6 text-balance">
          Visão Geral
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">MRR</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                R$ {currentMRR.toLocaleString("pt-BR")}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3 text-green-500" />
                +5.1% vs mês anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Assinantes Ativos
              </CardTitle>
              <Users className="h-4 w-4 text-chart-2" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeSubscribers}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3 text-green-500" />
                +12 novos este mês
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ticket Médio
              </CardTitle>
              <DollarSign className="h-4 w-4 text-chart-3" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {averageTicket.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3 text-green-500" />
                +8.3% vs mês anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
              <UserMinus className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {churnRate}%
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <ArrowDownRight className="h-3 w-3 text-green-500" />
                -0.3% vs mês anterior
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-6 text-balance">
          Métricas Avançadas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {advancedMetrics.map((metric, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {metric.metric}
                </CardTitle>
                {metric.change > 0 ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metric.unit === "R$" && "R$ "}
                  {metric.value}
                  {metric.unit !== "R$" && ` ${metric.unit}`}
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <span
                    className={
                      metric.change > 0 ? "text-green-500" : "text-red-500"
                    }
                  >
                    {metric.change > 0 ? "+" : ""}
                    {metric.change.toFixed(1)}%
                  </span>
                  {metric.period}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Seção 2: Gráfico de Crescimento */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-balance">
            Crescimento Anual
          </h2>
          <div className="flex gap-2">
            <Button
              variant={chartView === "receita" ? "default" : "outline"}
              size="sm"
              onClick={() => setChartView("receita")}
            >
              Receita
            </Button>
            <Button
              variant={chartView === "mrr" ? "default" : "outline"}
              size="sm"
              onClick={() => setChartView("mrr")}
            >
              MRR
            </Button>
            <Button
              variant={chartView === "assinantes" ? "default" : "outline"}
              size="sm"
              onClick={() => setChartView("assinantes")}
            >
              Novos Assinantes
            </Button>
            <Button
              variant={chartView === "cancelamentos" ? "default" : "outline"}
              size="sm"
              onClick={() => setChartView("cancelamentos")}
            >
              Cancelamentos
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="capitalize">
              {chartView === "receita"
                ? "Receita Mensal"
                : chartView === "mrr"
                ? "MRR (Monthly Recurring Revenue)"
                : chartView === "assinantes"
                ? "Novos Assinantes"
                : "Cancelamentos"}
            </CardTitle>
            <CardDescription>
              {chartView === "receita" &&
                "Evolução da receita bruta nos últimos 12 meses"}
              {chartView === "mrr" &&
                "Crescimento da receita recorrente mensal"}
              {chartView === "assinantes" &&
                "Novos assinantes adquiridos por mês"}
              {chartView === "cancelamentos" &&
                "Assinantes que cancelaram por mês"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                {chartView === "mrr" ? (
                  <AreaChart data={getChartData()}>
                    <defs>
                      <linearGradient id="colorMRR" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor={getChartColor()}
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor={getChartColor()}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                    />
                    <XAxis dataKey="month" className="text-muted-foreground" />
                    <YAxis className="text-muted-foreground" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [
                        `R$ ${value.toLocaleString("pt-BR")}`,
                        "MRR",
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={getChartColor()}
                      fillOpacity={1}
                      fill="url(#colorMRR)"
                    />
                  </AreaChart>
                ) : (
                  <BarChart data={getChartData()}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                    />
                    <XAxis dataKey="month" className="text-muted-foreground" />
                    <YAxis className="text-muted-foreground" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number, name: string) => [
                        chartView === "receita"
                          ? `R$ ${value.toLocaleString("pt-BR")}`
                          : value,
                        chartView === "receita"
                          ? "Receita"
                          : chartView === "assinantes"
                          ? "Novos Assinantes"
                          : "Cancelamentos",
                      ]}
                    />
                    <Bar
                      dataKey="value"
                      fill={getChartColor()}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Seção 3: Detalhes da Receita */}
      <section>
        <h2 className="text-2xl font-semibold mb-6 text-balance">
          Detalhes da Receita
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Divisão de Planos */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Planos</CardTitle>
              <CardDescription>
                Assinantes por categoria de plano
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={planData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {planData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number, name: string, props: any) => [
                        `${value} assinantes (R$ ${props.payload.price})`,
                        "Quantidade",
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {planData.map((entry, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-sm font-medium">{entry.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {entry.value}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Transações Recentes */}
          <Card>
            <CardHeader>
              <CardTitle>Transações Recentes</CardTitle>
              <CardDescription>
                Últimas 8 atividades financeiras
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {recentTransactions.map((transaction, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-primary/10">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {transaction.user}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(transaction.date).toLocaleDateString(
                            "pt-BR"
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">
                        {transaction.value}
                      </p>
                      <div className="flex gap-1">
                        <Badge variant="secondary" className="text-xs">
                          {transaction.plan}
                        </Badge>
                        <Badge
                          variant={
                            transaction.type === "new"
                              ? "default"
                              : transaction.type === "upgrade"
                              ? "secondary"
                              : "outline"
                          }
                          className="text-xs"
                        >
                          {transaction.type === "new"
                            ? "Novo"
                            : transaction.type === "upgrade"
                            ? "Upgrade"
                            : "Renovação"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Seção 4: Metas e Motivação */}
      <section>
        <h2 className="text-2xl font-semibold mb-6 text-balance">
          Metas e Projeções
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Projeção Anual */}
          <Card className="border-chart-2/20 bg-gradient-to-br from-chart-2/5 to-chart-2/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-chart-2" />
                Projeção de Receita Anual (ARR)
              </CardTitle>
              <CardDescription>
                Com base no seu MRR atual de R${" "}
                {currentMRR.toLocaleString("pt-BR")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-chart-2 mb-2">
                R$ {annualProjection.toLocaleString("pt-BR")}
              </div>
              <p className="text-sm text-muted-foreground">
                Receita projetada mantendo os assinantes atuais
              </p>
              <div className="mt-4 p-3 bg-chart-2/10 rounded-lg">
                <p className="text-sm font-medium">Meta anual: R$ 96.000</p>
                <p className="text-xs text-muted-foreground">
                  Você está a 72.5% da meta!
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Meta Mensal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Meta de MRR Mensal
              </CardTitle>
              <CardDescription>
                Progresso em direção à meta de R${" "}
                {monthlyGoal.toLocaleString("pt-BR")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Atual: R$ {currentMRR.toLocaleString("pt-BR")}</span>
                  <span>Meta: R$ {monthlyGoal.toLocaleString("pt-BR")}</span>
                </div>
                <Progress value={progress} className="h-3" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{progress.toFixed(1)}% concluído</span>
                  <span>
                    Faltam R${" "}
                    {(monthlyGoal - currentMRR).toLocaleString("pt-BR")}
                  </span>
                </div>
                <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                  <p className="text-sm font-medium">
                    Estimativa para atingir a meta:
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Precisamos de ~
                    {Math.ceil((monthlyGoal - currentMRR) / averageTicket)}{" "}
                    novos assinantes
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
