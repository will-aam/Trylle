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
} from "lucide-react";

export function Sidebar() {
  return (
    <aside className="h-full w-full rounded-2xl bg-[#0f0f0f]/80 shadow-lg backdrop-blur-md flex flex-col">
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Search - sutil */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar..."
            aria-label="Buscar"
            className="w-full rounded-full bg-white/5 pl-9 pr-4 py-2 text-sm text-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-white/10"
          />
        </div>

        {/* Menu Section */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Menu
          </h3>
          <ul className="space-y-1 mt-3">
            <li>
              <Link href="/">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                >
                  <Home className="w-5 h-5" />
                  <span className="text-sm font-medium">Explorar</span>
                </Button>
              </Link>
            </li>
            <li>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                <Library className="w-5 h-5" />
                <span className="text-sm font-medium">Minha Biblioteca</span>
              </Button>
            </li>
            {/* NOVOS ITENS ADICIONADOS AQUI */}
            <li>
              <Link href="/achievements">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                >
                  <Trophy className="w-5 h-5" />
                  <span className="text-sm font-medium">Minhas Conquistas</span>
                </Button>
              </Link>
            </li>
            <li>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                <Brain className="w-5 h-5" />
                <span className="text-sm font-medium">Sugerir um Tema</span>
              </Button>
            </li>
            <li>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                <Users className="w-5 h-5" />
                <span className="text-sm font-medium">Comunidade</span>
              </Button>
            </li>
          </ul>
        </div>

        {/* Library Section */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Biblioteca
          </h3>
          <ul className="space-y-1">
            <li>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                <Clock className="w-5 h-5" />
                <span className="text-sm font-medium">Recentes</span>
              </Button>
            </li>
            <li>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                <Heart className="w-5 h-5" />
                <span className="text-sm font-medium">Favoritos</span>
              </Button>
            </li>
            <li>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                <Download className="w-5 h-5" />
                <span className="text-sm font-medium">Downloads</span>
              </Button>
            </li>
          </ul>
        </div>

        {/* Playlist Section */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Playlist
          </h3>
          <ul className="space-y-1">
            <li>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span className="text-sm font-medium">Criar Nova</span>
              </Button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Logout */}
      <div className="p-4 ">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-white/5 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Sair</span>
        </Button>
      </div>
    </aside>
  );
}
