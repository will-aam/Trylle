// src/components/layout/admin-sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LogOut,
  ChevronLeft,
  ChevronRight,
  Users,
  Settings,
  MonitorCog,
  Wallet,
  Eye,
  LibraryBig,
  MessagesSquare,
  Radio,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { Button } from "@/src/components/ui/button";
import { createSupabaseBrowserClient } from "@/src/lib/supabase-client";
import { ThemeToggle } from "@/src/components/layout/theme-toggle";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";

interface AdminSidebarProps {
  isCollapsed: boolean;
  setCollapsed: () => void;
  isMobile?: boolean;
  onCloseSidebar?: () => void;
}

export function AdminSidebar({
  isCollapsed,
  setCollapsed,
  isMobile = false,
  onCloseSidebar,
}: AdminSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createSupabaseBrowserClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
    if (isMobile && onCloseSidebar) {
      onCloseSidebar();
    }
  };

  const handleLinkClick = () => {
    if (isMobile && onCloseSidebar) {
      onCloseSidebar();
    }
  };

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-10 flex flex-col border-r bg-background transition-all duration-300",
        isCollapsed && !isMobile ? "w-16" : "w-64"
      )}
    >
      <TooltipProvider>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b p-4">
            {!isCollapsed && (
              <h1 className="text-xl font-bold text-foreground">Studio</h1>
            )}
            {isCollapsed && <div className="flex-1" />}
            <div className="flex items-center gap-2">
              {!isCollapsed && <ThemeToggle />}
              {!isMobile && (
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
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-4">
            <nav className="grid items-start space-y-1 px-2 text-sm font-medium">
              <SidebarLink
                href="/"
                icon={<Eye className="h-4 w-4" />}
                label="Início"
                isCollapsed={isCollapsed}
                isActive={pathname === "/"}
                onClick={handleLinkClick}
              />

              {/* ITEM DO PAINEL OCULTO NO MOBILE */}
              <div className="hidden md:block">
                <SidebarLink
                  href="/admin"
                  icon={<MonitorCog className="h-4 w-4" />}
                  label={"Painel"}
                  isCollapsed={isCollapsed}
                  isActive={pathname === "/admin"}
                  onClick={handleLinkClick}
                />
              </div>

              {isCollapsed ? (
                <>
                  <SidebarLink
                    href="/admin/episodes"
                    icon={<LibraryBig className="h-4 w-4" />}
                    label="Gerenciar Episódios"
                    isCollapsed={isCollapsed}
                    isActive={pathname.startsWith("/admin/episodes")}
                    onClick={handleLinkClick}
                  />
                  <SidebarLink
                    href="/admin/programs"
                    icon={<Radio className="h-4 w-4" />}
                    label="Gerenciar Programas"
                    isCollapsed={isCollapsed}
                    isActive={pathname.startsWith("/admin/programs")}
                    onClick={handleLinkClick}
                  />
                </>
              ) : (
                <Accordion
                  type="single"
                  collapsible
                  className="w-full"
                  defaultValue={
                    pathname.startsWith("/admin/episodes")
                      ? "episodes-manager"
                      : pathname.startsWith("/admin/programs")
                      ? "programs-manager"
                      : ""
                  }
                >
                  <AccordionItem
                    value="episodes-manager"
                    className="border-b-0"
                  >
                    <AccordionTrigger
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground hover:no-underline",
                        pathname.startsWith("/admin/episodes") &&
                          "bg-accent text-foreground"
                      )}
                    >
                      <Link
                        href="/admin/episodes"
                        className="flex w-full items-center gap-3"
                        onClick={handleLinkClick}
                      >
                        <LibraryBig className="h-4 w-4" />
                        <span className="truncate">Gerenciar Episódios</span>
                      </Link>
                    </AccordionTrigger>
                    <AccordionContent className="mt-1 space-y-2 pl-12">
                      <Link
                        href="#"
                        className="flex items-center gap-2 text-xs text-muted-foreground transition-all hover:text-foreground"
                        onClick={handleLinkClick}
                      >
                        <ChevronRight className="h-3 w-3" />
                        <span>Análises</span>
                      </Link>
                      <Link
                        href="#"
                        className="flex items-center gap-2 text-xs text-muted-foreground transition-all hover:text-foreground"
                        onClick={handleLinkClick}
                      >
                        <ChevronRight className="h-3 w-3" />
                        <span>Agendamentos</span>
                      </Link>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem
                    value="programs-manager"
                    className="border-b-0"
                  >
                    <AccordionTrigger
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground hover:no-underline",
                        pathname.startsWith("/admin/programs") &&
                          "bg-accent text-foreground"
                      )}
                    >
                      <Link
                        href="/admin/programs"
                        className="flex w-full items-center gap-3"
                        onClick={handleLinkClick}
                      >
                        <Radio className="h-4 w-4" />
                        <span className="truncate">Gerenciar Programas</span>
                      </Link>
                    </AccordionTrigger>
                    <AccordionContent className="mt-1 space-y-2 pl-12">
                      <Link
                        href="#"
                        className="flex items-center gap-2 text-xs text-muted-foreground transition-all hover:text-foreground"
                        onClick={handleLinkClick}
                      >
                        <ChevronRight className="h-3 w-3" />
                        <span>Análises</span>
                      </Link>
                      <Link
                        href="#"
                        className="flex items-center gap-2 text-xs text-muted-foreground transition-all hover:text-foreground"
                        onClick={handleLinkClick}
                      >
                        <ChevronRight className="h-3 w-3" />
                        <span>Agendamentos</span>
                      </Link>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}

              <SidebarLink
                href="/admin/users"
                icon={<Users className="h-4 w-4" />}
                label="Gerenciar Usuários"
                isCollapsed={isCollapsed}
                isActive={pathname === "/admin/users"}
                onClick={handleLinkClick}
              />
              <SidebarLink
                href="/"
                icon={<MessagesSquare className="h-4 w-4" />}
                label="Comunidade"
                isCollapsed={isCollapsed}
                isActive={pathname === "/community"}
                onClick={handleLinkClick}
              />
              <SidebarLink
                href="/admin/financial"
                icon={<Wallet className="h-4 w-4" />}
                label="Financeiro"
                isCollapsed={isCollapsed}
                isActive={pathname === "/admin/financial"}
                onClick={handleLinkClick}
              />
              <SidebarLink
                href="/admin/config"
                icon={<Settings className="h-4 w-4" />}
                label="Configurações"
                isCollapsed={isCollapsed}
                isActive={pathname === "/admin/config"}
                onClick={handleLinkClick}
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
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  isCollapsed: boolean;
  isActive?: boolean;
  onClick?: () => void;
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
            onClick={onClick}
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
        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
        isActive && "bg-accent text-foreground"
      )}
      onClick={onClick}
    >
      {icon}
      <span className="truncate">{label}</span>
    </Link>
  );
}
