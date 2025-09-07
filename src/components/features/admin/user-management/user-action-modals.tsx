"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import {
  Shield,
  Key,
  UserX,
  Trash2,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { useToast } from "@/src/hooks/use-toast";
import type { User } from "./user-management";

interface UserActionModalsProps {
  user: User;
  modalType: "role" | "password" | "suspend" | "delete";
  onClose: () => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
}

export function UserActionModals({
  user,
  modalType,
  onClose,
  onUpdateUser,
  onDeleteUser,
}: UserActionModalsProps) {
  const [confirmText, setConfirmText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleRoleChange = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const updatedUser = {
      ...user,
      role: user.role === "admin" ? ("user" as const) : ("admin" as const),
    };
    onUpdateUser(updatedUser);
    toast({
      title: "Função alterada com sucesso",
      description: `${user.name} agora é ${
        updatedUser.role === "admin" ? "administrador" : "usuário comum"
      }.`,
    });
    setIsLoading(false);
    onClose();
  };

  const handlePasswordReset = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast({
      title: "E-mail de redefinição enviado",
      description: `Um e-mail de redefinição de senha foi enviado para ${user.email}.`,
    });
    setIsLoading(false);
    onClose();
  };

  const handleSuspendUser = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const updatedUser = { ...user, isActive: !user.isActive };
    onUpdateUser(updatedUser);
    toast({
      title: updatedUser.isActive ? "Usuário reativado" : "Usuário suspenso",
      description: `${user.name} foi ${
        updatedUser.isActive ? "reativado" : "suspenso"
      } com sucesso.`,
    });
    setIsLoading(false);
    onClose();
  };

  const handleDeleteUser = async () => {
    if (confirmText !== user.name) {
      toast({
        title: "Confirmação incorreta",
        description: "Digite o nome do usuário exatamente como mostrado.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    onDeleteUser(user.id);
    toast({
      title: "Usuário deletado",
      description: `${user.name} foi removido permanentemente do sistema.`,
      variant: "destructive",
    });
    setIsLoading(false);
    onClose();
  };

  const renderModalContent = () => {
    switch (modalType) {
      case "role":
        return (
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {user.role === "admin"
                  ? "Remover Privilégios de Admin"
                  : "Promover a Administrador"}
              </DialogTitle>
              <DialogDescription>
                {user.role === "admin"
                  ? `Você está prestes a remover os privilégios de administrador de ${user.name}. Eles não poderão mais acessar funcionalidades administrativas.`
                  : `Você está prestes a dar privilégios de administrador para ${user.name}. Eles terão acesso completo ao sistema.`}
              </DialogDescription>
            </DialogHeader>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Esta ação afetará imediatamente as permissões do usuário no
                sistema.
              </AlertDescription>
            </Alert>
            <DialogFooter>
              <Button variant="outline" onClick={onClose} disabled={isLoading}>
                Cancelar
              </Button>
              <Button onClick={handleRoleChange} disabled={isLoading}>
                {isLoading ? "Processando..." : "Confirmar Alteração"}
              </Button>
            </DialogFooter>
          </DialogContent>
        );
      case "password":
        return (
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Redefinir Senha
              </DialogTitle>
              <DialogDescription>
                Um e-mail de redefinição de senha será enviado para {user.email}
                .
              </DialogDescription>
            </DialogHeader>
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                O usuário receberá instruções para criar uma nova senha em seu
                e-mail.
              </AlertDescription>
            </Alert>
            <DialogFooter>
              <Button variant="outline" onClick={onClose} disabled={isLoading}>
                Cancelar
              </Button>
              <Button onClick={handlePasswordReset} disabled={isLoading}>
                {isLoading ? "Enviando..." : "Enviar E-mail"}
              </Button>
            </DialogFooter>
          </DialogContent>
        );
      case "suspend":
        return (
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserX className="h-5 w-5" />
                {user.isActive ? "Suspender Usuário" : "Reativar Usuário"}
              </DialogTitle>
              <DialogDescription>
                {user.isActive
                  ? `${user.name} não conseguirá mais fazer login até que a conta seja reativada.`
                  : `${user.name} poderá fazer login novamente no sistema.`}
              </DialogDescription>
            </DialogHeader>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {user.isActive
                  ? "O usuário será desconectado imediatamente de todas as sessões ativas."
                  : "O usuário poderá acessar o sistema normalmente após a reativação."}
              </AlertDescription>
            </Alert>
            <DialogFooter>
              <Button variant="outline" onClick={onClose} disabled={isLoading}>
                Cancelar
              </Button>
              <Button
                onClick={handleSuspendUser}
                disabled={isLoading}
                variant={user.isActive ? "destructive" : "default"}
              >
                {isLoading
                  ? "Processando..."
                  : user.isActive
                  ? "Suspender"
                  : "Reativar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        );
      case "delete":
        return (
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="h-5 w-5" />
                Deletar Usuário Permanentemente
              </DialogTitle>
              <DialogDescription>
                Esta ação não pode ser desfeita. Todos os dados de {user.name}{" "}
                serão perdidos permanentemente.
              </DialogDescription>
            </DialogHeader>
            <Alert className="border-destructive">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-destructive">
                <strong>Atenção:</strong> Esta é uma ação irreversível. Todos os
                dados, histórico e configurações do usuário serão removidos
                permanentemente.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label htmlFor="confirm-name">
                Digite <strong>{user.name}</strong> para confirmar:
              </Label>
              <Input
                id="confirm-name"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={user.name}
                className="font-mono"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={onClose} disabled={isLoading}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteUser}
                disabled={isLoading || confirmText !== user.name}
              >
                {isLoading ? "Deletando..." : "Deletar Permanentemente"}
              </Button>
            </DialogFooter>
          </DialogContent>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      {renderModalContent()}
    </Dialog>
  );
}
