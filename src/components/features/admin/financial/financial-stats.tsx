import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { DollarSign, Users, TrendingUp, TrendingDown } from "lucide-react";

export function FinancialStats() {
  return (
    // Este grid garante que os 4 cards fiquem lado a lado em telas maiores
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Receita Mensal (MRR)
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">R$ 4.950,00</div>
          <p className="text-xs text-muted-foreground">
            +15,2% em relação ao mês passado
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Assinantes Ativos
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+500</div>
          <p className="text-xs text-muted-foreground">+50 no último mês</p>
        </CardContent>
      </Card>

      {/* --- CÓDIGO QUE PROVAVELMENTE ESTAVA FALTANDO --- */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">R$ 9,90</div>
          <p className="text-xs text-muted-foreground">
            Receita média por usuário
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">2,1%</div>
          <p className="text-xs text-muted-foreground">
            Taxa de cancelamento mensal
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
