"use client";

import { Button } from "@/src/components/ui/button";
import Link from "next/link";
import {
  Search,
  Library,
  Plus,
  Heart,
  Download,
  TrendingUp,
  Clock,
  User,
  Settings,
  LogOut,
  Home,
  Disc,
  Album,
  Mic2,
  Folder,
  Music2,
} from "lucide-react";

export function Sidebar() {
  return (
    <aside className="w-64 bg-[#0f0f0f] border-r border-white/5  flex-col fixed top-16 left-0 h-[calc(100vh-4rem)] z-20 hidden lg:block">
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Menu Section */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Menu
          </h3>
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:inline-flex rounded-full"
          >
            <Download className="mr-2 h-4 w-4" />
            Instalar Aplicativo
          </Button>
          <ul className="space-y-1">
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
                <Search className="w-5 h-5" />
                <span className="text-sm font-medium">Buscar</span>
              </Button>
            </li>
            <li>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                <Library className="w-5 h-5" />
                <span className="text-sm font-medium">Sua Biblioteca</span>
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

        {/* Profile Section */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Perfil
          </h3>
          <ul className="space-y-1">
            <li>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                <User className="w-5 h-5" />
                <span className="text-sm font-medium">Perfil</span>
              </Button>
            </li>
            <li>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                <Settings className="w-5 h-5" />
                <span className="text-sm font-medium">Configurações</span>
              </Button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/5">
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
