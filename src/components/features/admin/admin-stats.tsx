import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Play, Users, Star, TrendingUp } from "lucide-react";

const stats = [
  {
    title: "Total de Episódios",
    value: "1,234",
    change: "+12%",
    icon: Play,
    color: "text-blue-600",
  },
  {
    title: "Usuários Ativos",
    value: "45,678",
    change: "+8%",
    icon: Users,
    color: "text-green-600",
  },
  {
    title: "Avaliação Média",
    value: "4.8",
    change: "+0.2",
    icon: Star,
    color: "text-yellow-600",
  },
  {
    title: "Horas Ouvidas",
    value: "123,456",
    change: "+15%",
    icon: TrendingUp,
    color: "text-purple-600",
  },
];

export function AdminStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{stat.change}</span> em relação
              ao mês anterior
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
