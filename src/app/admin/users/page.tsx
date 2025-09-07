import { UserManagement } from "@/src/components/features/admin/user-management/user-management";
import { Suspense } from "react";

export default function AdminUsersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<p>Carregando gerenciador de usuários...</p>}>
        <UserManagement />
      </Suspense>
    </div>
  );
}
