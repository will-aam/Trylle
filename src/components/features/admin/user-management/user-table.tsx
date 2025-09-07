"use client";

import { useState } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Mail,
  Chrome,
  Shield,
  Key,
  UserX,
  Trash2,
} from "lucide-react";
import { UserActionModals } from "./user-action-modals";
import type { User } from "./user-management";

interface UserTableProps {
  users: User[];
  setUsers: (users: User[]) => void;
}

export function UserTable({ users, setUsers }: UserTableProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalType, setModalType] = useState<
    "role" | "password" | "suspend" | "delete" | null
  >(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleAction = (
    user: User,
    action: "role" | "password" | "suspend" | "delete"
  ) => {
    setSelectedUser(user);
    setModalType(action);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUsers(
      users.map((user) => (user.id === updatedUser.id ? updatedUser : user))
    );
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter((user) => user.id !== userId));
  };

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-medium text-muted-foreground">
                    Usuário
                  </th>
                  <th className="text-left p-4 font-medium text-muted-foreground hidden sm:table-cell">
                    E-mail
                  </th>
                  <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">
                    Data de Cadastro
                  </th>
                  <th className="text-left p-4 font-medium text-muted-foreground hidden lg:table-cell">
                    Método
                  </th>
                  <th className="text-left p-4 font-medium text-muted-foreground">
                    Função
                  </th>
                  <th className="text-left p-4 font-medium text-muted-foreground hidden xl:table-cell">
                    Último Login
                  </th>
                  <th className="text-left p-4 font-medium text-muted-foreground">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-border hover:bg-muted/50"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={user.avatar || "/placeholder.svg"}
                            alt={user.name}
                          />
                          <AvatarFallback>
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="font-medium truncate">
                            {user.name}
                          </div>
                          <div className="text-sm text-muted-foreground sm:hidden truncate">
                            {user.email}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <span
                              className={
                                user.isActive
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {user.isActive ? "Ativo" : "Inativo"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm hidden sm:table-cell">
                      <div className="truncate max-w-[200px]">{user.email}</div>
                    </td>
                    <td className="p-4 text-sm hidden md:table-cell">
                      {formatDate(user.registrationDate)}
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        {user.registrationMethod === "email" ? (
                          <Mail className="h-4 w-4" />
                        ) : (
                          <Chrome className="h-4 w-4" />
                        )}
                        <span className="text-sm capitalize">
                          {user.registrationMethod}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge
                        variant={
                          user.role === "admin" ? "default" : "secondary"
                        }
                        className="whitespace-nowrap"
                      >
                        {user.role === "admin" ? "Admin" : "Usuário"}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm hidden xl:table-cell">
                      {formatDate(user.lastLogin)}
                    </td>
                    <td className="p-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleAction(user, "role")}
                          >
                            <Shield className="mr-2 h-4 w-4" />
                            {user.role === "admin"
                              ? "Remover Admin"
                              : "Promover a Admin"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleAction(user, "password")}
                          >
                            <Key className="mr-2 h-4 w-4" />
                            Redefinir Senha
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleAction(user, "suspend")}
                          >
                            <UserX className="mr-2 h-4 w-4" />
                            {user.isActive
                              ? "Suspender Usuário"
                              : "Reativar Usuário"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleAction(user, "delete")}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Deletar Usuário
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {selectedUser && modalType && (
        <UserActionModals
          user={selectedUser}
          modalType={modalType}
          onClose={() => {
            setSelectedUser(null);
            setModalType(null);
          }}
          onUpdateUser={handleUpdateUser}
          onDeleteUser={handleDeleteUser}
        />
      )}
    </>
  );
}
