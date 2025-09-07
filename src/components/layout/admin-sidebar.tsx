"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LogOut,
  ChevronLeft,
  ChevronRight,
  Users,
  Settings,
  MonitorCog,
  Wallet,
  Home,
  LibraryBig,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { Button } from "@/src/components/ui/button";
import { createClient } from "@/src/lib/supabase-client";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/src/lib/utils";

interface AdminSidebarProps {
  isCollapsed: boolean;
  setCollapsed: () => void;
}

export function AdminSidebar({ isCollapsed, setCollapsed }: AdminSidebarProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-10 flex flex-col border-r bg-background transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <TooltipProvider>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            {!isCollapsed && (
              <h1 className="text-xl font-bold text-foreground">PlayCast</h1>
            )}
            {isCollapsed && <div className="flex-1" />}
            <div className="flex items-center gap-2">
              {!isCollapsed && <ThemeToggle />}
              <Button
                onClick={setCollapsed}
                variant="ghost"
                size="icon"
                className="h-8 w-8"
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-4">
            <nav className="grid items-start px-2 text-sm font-medium space-y-1">
              <SidebarLink
                href="/"
                icon={<Home className="h-4 w-4" />}
                label="Início"
                isCollapsed={isCollapsed}
              />
              <SidebarLink
                href="/admin"
                icon={<MonitorCog className="h-4 w-4" />}
                label={"Painel"}
                isCollapsed={isCollapsed}
              />
              <SidebarLink
                href="/admin/config"
                icon={<LibraryBig className="h-4 w-4" />}
                label="Gerenciar Episódios"
                isCollapsed={isCollapsed}
              />
              <SidebarLink
                href="/admin/users"
                icon={<Users className="h-4 w-4" />}
                label="Gerenciador de usuários"
                isCollapsed={isCollapsed}
              />
              <SidebarLink
                href="/admin/config"
                icon={<Wallet className="h-4 w-4" />}
                label="Financeiro"
                isCollapsed={isCollapsed}
              />
              <SidebarLink
                href="/admin/config"
                icon={<Settings className="h-4 w-4" />}
                label="Configurações"
                isCollapsed={isCollapsed}
              />
            </nav>
          </div>

          <div className="border-t p-4">
            {isCollapsed ? (
              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleLogout}
                  variant="destructive"
                  size="icon"
                  className="w-full"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleLogout}
                variant="destructive"
                className="w-full justify-start"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            )}
          </div>
        </div>
      </TooltipProvider>
    </aside>
  );
}

function SidebarLink({
  href,
  icon,
  label,
  isCollapsed,
  isActive = false,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  isCollapsed: boolean;
  isActive?: boolean;
}) {
  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={href}
            className={cn(
              "flex items-center justify-center rounded-lg p-3 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
              isActive && "bg-accent text-foreground"
            )}
          >
            {icon}
            <span className="sr-only">{label}</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-foreground",
        isActive && "bg-accent text-foreground"
      )}
    >
      {icon}
      {label}
    </Link>
  );
}
