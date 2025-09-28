"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ProfileSidebar } from "./profile-sidebar";
import { createSupabaseBrowserClient } from "@/src/lib/supabase-client"; // 1. Importar

export function UserMenu() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const supabase = createSupabaseBrowserClient(); // 2. Criar o cliente supabase

  // Seus dados de usuário virão de algum contexto ou hook, mas para o teste, vamos usar um mock
  const user = {
    name: "Usuário",
    avatar:
      "https://api.dicebear.com/9.x/thumbs/svg?backgroundType=gradientLinear,solid",
  };

  // 3. Adicionar a função de logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsSidebarOpen(false); // Opcional: fechar o sidebar após o logout
  };

  return (
    <>
      <Button
        variant="ghost"
        className="relative h-9 w-9 rounded-full"
        onClick={() => setIsSidebarOpen(true)}
      >
        <Avatar className="h-9 w-9">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
      </Button>

      <ProfileSidebar
        isOpen={isSidebarOpen}
        onOpenChange={setIsSidebarOpen}
        onLogout={handleLogout} // 4. Passar a função para o sidebar
      />
    </>
  );
}
