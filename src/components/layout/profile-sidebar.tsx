// src/components/layout/profile-sidebar.tsx
"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/src/components/ui/sheet";
import { Button } from "@/src/components/ui/button";
import Link from "next/link";
import { Settings, BarChart3, CreditCard, LogOut } from "lucide-react"; // 1. Adicionar LogOut

interface ProfileSidebarProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onLogout: () => void; // 2. Adicionar a propriedade onLogout
}

export function ProfileSidebar({
  isOpen,
  onOpenChange,
  onLogout,
}: ProfileSidebarProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-xs sm:max-w-sm p-0 flex flex-col bg-background border-l">
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle className="text-lg font-semibold">Sua Conta</SheetTitle>
        </SheetHeader>
        <div className="flex-1 p-4 space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start text-base p-4 h-auto"
            asChild
          >
            <Link href="/settings">
              <Settings className="mr-3 h-5 w-5" />
              Configurações
            </Link>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-base p-4 h-auto"
            asChild
          >
            <Link href="/statistics">
              <BarChart3 className="mr-3 h-5 w-5" />
              Suas Estatísticas
            </Link>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-base p-4 h-auto"
            asChild
          >
            <Link href="/payments">
              <CreditCard className="mr-3 h-5 w-5" />
              Pagamentos
            </Link>
          </Button>
        </div>
        {/* 3. Trocar o botão "Fechar" pelo botão "Sair" */}
        <div className="p-4 border-t mt-auto">
          <Button
            variant="ghost"
            className="w-full justify-start text-base p-4 h-auto text-red-500 hover:text-red-600"
            onClick={onLogout}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sair
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
