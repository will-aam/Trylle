// src/components/features/home/layout/sidebar.tsx
"use client";

import { Button } from "@/src/components/ui/button";
import Link from "next/link";
import {
  Search,
  Library,
  Plus,
  Heart,
  Download,
  Clock,
  LogOut,
  Home,
  Trophy,
  Brain,
  Users,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/src/lib/utils"; // <-- NOVO: Importe o cn

// 1. Definimos as props que o componente agora espera
interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

export function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  return (
    <aside
      className={cn(
        "h-full w-full rounded-2xl bg-[#0f0f0f]/80 shadow-lg backdrop-blur-md flex flex-col transition-all duration-300",
        isCollapsed && "items-center" // Centraliza ícones quando encolhido
      )}
    >
      {/* 2. Botão para Encolher/Expandir */}
      <div
        className={cn(
          "py-4 px-4", // Mantém o padding para o botão
          isCollapsed ? "flex justify-center" : "flex justify-end"
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 text-gray-300 hover:bg-white/5 hover:text-white"
        >
          {isCollapsed ? (
            <ChevronsRight className="w-5 h-5" />
          ) : (
            <ChevronsLeft className="w-5 h-5" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 space-y-6">
        {/* Search - Apenas ícone quando encolhido */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar..."
            aria-label="Buscar"
            className={cn(
              "w-full rounded-full bg-white/5 pl-9 pr-4 py-2 text-sm text-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-white/10",
              isCollapsed && "hidden" // Esconde o input quando encolhido
            )}
          />
          {/* Botão de busca que aparece quando encolhido */}
          {isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="w-full h-10 text-gray-300 hover:bg-white/5 hover:text-white"
            >
              <Search className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* Menu Section */}
        <div>
          {!isCollapsed && (
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Menu
            </h3>
          )}
          <ul className="space-y-1">
            <li>
              <Link href="/">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors",
                    isCollapsed ? "justify-center" : "justify-start"
                  )}
                >
                  <Home className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="text-sm font-medium">Início</span>
                  )}
                </Button>
              </Link>
            </li>
            <li>
              <Link href="/library-in">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors",
                    isCollapsed ? "justify-center" : "justify-start"
                  )}
                >
                  <Library className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="text-sm font-medium">
                      Minha Biblioteca
                    </span>
                  )}
                </Button>
              </Link>
            </li>
            <li>
              <Link href="/achievements">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors",
                    isCollapsed ? "justify-center" : "justify-start"
                  )}
                >
                  <Trophy className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="text-sm font-medium">
                      Minhas Conquistas
                    </span>
                  )}
                </Button>
              </Link>
            </li>
            <li>
              <Link href="/suggest-topic-in">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors",
                    isCollapsed ? "justify-center" : "justify-start"
                  )}
                >
                  <Brain className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="text-sm font-medium">Sugerir um Tema</span>
                  )}
                </Button>
              </Link>
            </li>
            <li>
              <Link href="/community">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors",
                    isCollapsed ? "justify-center" : "justify-start"
                  )}
                >
                  <Users className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="text-sm font-medium">Comunidade</span>
                  )}
                </Button>
              </Link>
            </li>
          </ul>
        </div>

        {/* Library Section */}
        <div>
          {!isCollapsed && (
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Biblioteca
            </h3>
          )}
          <ul className="space-y-1">
            <li>
              <Link href="/recent-in">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors",
                    isCollapsed ? "justify-center" : "justify-start"
                  )}
                >
                  <Clock className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="text-sm font-medium">Recentes</span>
                  )}
                </Button>
              </Link>
            </li>
            <li>
              <Link href="/favorites-in">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors",
                    isCollapsed ? "justify-center" : "justify-start"
                  )}
                >
                  <Heart className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="text-sm font-medium">Favoritos</span>
                  )}
                </Button>
              </Link>
            </li>
            <li>
              <Link href="/downloads-in">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors",
                    isCollapsed ? "justify-center" : "justify-start"
                  )}
                >
                  <Download className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="text-sm font-medium">Downloads</span>
                  )}
                </Button>
              </Link>
            </li>
          </ul>
        </div>

        {/* Playlist Section */}
        <div>
          {!isCollapsed && (
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Playlist
            </h3>
          )}
          <ul className="space-y-1">
            <li>
              <Button
                variant="ghost"
                className={cn(
                  "w-full gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors",
                  isCollapsed ? "justify-center" : "justify-start"
                )}
              >
                <Plus className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="text-sm font-medium">Criar Nova</span>
                )}
              </Button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Logout */}
      <div className="p-4">
        <Button
          variant="ghost"
          className={cn(
            "w-full gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-white/5 hover:text-red-400 transition-colors",
            isCollapsed ? "justify-center" : "justify-start"
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium">Sair</span>}
        </Button>
      </div>
    </aside>
  );
}
