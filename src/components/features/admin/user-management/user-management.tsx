"use client";

import { useState, useMemo } from "react";
import { UserStats } from "./user-stats";
import { UserTable } from "./user-table";
import { UserFilters } from "./user-filters";
import { Card, CardContent } from "@/src/components/ui/card";
import { Users } from "lucide-react";

// Mock user data
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  registrationDate: string;
  registrationMethod: "email" | "google";
  role: "admin" | "user";
  lastLogin: string;
  isActive: boolean;
}

const mockUsers: User[] = [
  {
    id: "1",
    name: "Ana Silva",
    email: "ana.silva@email.com",
    avatar: "https://api.dicebear.com/9.x/thumbs/svg?seed=Chase",
    registrationDate: "2024-01-15",
    registrationMethod: "email",
    role: "admin",
    lastLogin: "2024-03-10",
    isActive: true,
  },
  {
    id: "2",
    name: "Carlos Santos",
    email: "carlos.santos@email.com",
    avatar: "https://api.dicebear.com/9.x/thumbs/svg?seed=Chase",
    registrationDate: "2024-02-20",
    registrationMethod: "google",
    role: "user",
    lastLogin: "2024-03-09",
    isActive: true,
  },
  {
    id: "3",
    name: "Maria Oliveira",
    email: "maria.oliveira@email.com",
    avatar: "https://api.dicebear.com/9.x/thumbs/svg?seed=Chase",
    registrationDate: "2024-01-30",
    registrationMethod: "email",
    role: "user",
    lastLogin: "2024-02-28",
    isActive: false,
  },
  {
    id: "4",
    name: "João Pereira",
    email: "joao.pereira@email.com",
    avatar: "https://api.dicebear.com/9.x/thumbs/svg?seed=Chase",
    registrationDate: "2024-03-01",
    registrationMethod: "google",
    role: "user",
    lastLogin: "2024-03-08",
    isActive: true,
  },
  {
    id: "5",
    name: "Fernanda Costa",
    email: "fernanda.costa@email.com",
    avatar: "https://api.dicebear.com/9.x/thumbs/svg?seed=Chase",
    registrationDate: "2024-02-10",
    registrationMethod: "email",
    role: "admin",
    lastLogin: "2024-03-10",
    isActive: true,
  },
];

export function UserManagement() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");
  const [methodFilter, setMethodFilter] = useState<"all" | "email" | "google">(
    "all"
  );
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesMethod =
        methodFilter === "all" || user.registrationMethod === methodFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && user.isActive) ||
        (statusFilter === "inactive" && !user.isActive);

      return matchesSearch && matchesRole && matchesMethod && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, methodFilter, statusFilter]);

  const clearFilters = () => {
    setSearchTerm("");
    setRoleFilter("all");
    setMethodFilter("all");
    setStatusFilter("all");
  };

  // CORREÇÃO APLICADA AQUI
  const hasActiveFilters =
    Boolean(searchTerm) ||
    roleFilter !== "all" ||
    methodFilter !== "all" ||
    statusFilter !== "all";

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-foreground text-balance">
          Gerenciamento de Usuários
        </h2>
        <p className="text-muted-foreground mt-2">
          Gerencie todos os usuários cadastrados na plataforma
        </p>
      </div>

      <UserStats users={users} />

      <UserFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        methodFilter={methodFilter}
        setMethodFilter={setMethodFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onClearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {hasActiveFilters && (
        <div className="text-sm text-muted-foreground">
          Mostrando {filteredUsers.length} de {users.length} usuários
        </div>
      )}

      {filteredUsers.length > 0 ? (
        <UserTable users={filteredUsers} setUsers={setUsers} />
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {hasActiveFilters
                ? "Nenhum usuário encontrado"
                : "Nenhum usuário cadastrado"}
            </h3>
            <p className="text-muted-foreground text-center max-w-md">
              {hasActiveFilters
                ? "Tente ajustar os filtros para encontrar os usuários que você está procurando."
                : "Quando usuários se cadastrarem na plataforma, eles aparecerão aqui."}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 text-primary hover:underline"
              >
                Limpar filtros
              </button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
