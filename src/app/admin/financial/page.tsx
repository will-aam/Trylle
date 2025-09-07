import { FinancialDashboard } from "@/src/components/features/admin/financial/financial-dashboard";
import { Suspense } from "react";

export default function AdminFinancialPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<p>Carregando painel financeiro...</p>}>
        <FinancialDashboard />
      </Suspense>
    </div>
  );
}
