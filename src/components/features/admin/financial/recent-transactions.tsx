import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { Badge } from "@/src/components/ui/badge";

const transactions = [
  { id: 1, user: "Carlos S.", plan: "Mensal", amount: 9.9, date: "10/03/2024" },
  { id: 2, user: "Ana S.", plan: "Anual", amount: 99.0, date: "08/03/2024" },
  { id: 3, user: "João P.", plan: "Mensal", amount: 9.9, date: "07/03/2024" },
  {
    id: 4,
    user: "Fernanda C.",
    plan: "Mensal",
    amount: 9.9,
    date: "07/03/2024",
  },
];

export function RecentTransactions() {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Transações Recentes</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuário</TableHead>
            <TableHead>Plano</TableHead>
            <TableHead className="text-right">Valor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="font-medium">{transaction.user}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    transaction.plan === "Anual" ? "default" : "secondary"
                  }
                >
                  {transaction.plan}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                R$ {transaction.amount.toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
