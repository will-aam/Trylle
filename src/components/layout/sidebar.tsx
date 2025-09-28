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
} from "lucide-react";

export function Sidebar() {
  return (
    <div className="w-48 bg-card p-2 fixed top-16 left-0 h-[calc(100vh-4rem)] z-20 hidden lg:block border-r border-border">
      <div className="space-y-4">
        {/* Navigation */}
        <div className="space-y-1">
          <Link href="/">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <span className="bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent text-sm">
                Sugerir Episódio
              </span>
            </Button>
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-sm"
          >
            <Search size={16} />
            Buscar
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-sm"
          >
            <Library size={16} />
            Sua Biblioteca
          </Button>
        </div>

        {/* Playlists */}
        <div className="space-y-1">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-sm"
          >
            <Plus size={16} />
            Criar Playlist
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-sm"
          >
            <Heart size={16} />
            Curtidos
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-sm"
          >
            <Download size={16} />
            Downloads
          </Button>
        </div>

        {/* Categories */}
        <div className="space-y-0.5">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-sm"
          >
            <TrendingUp size={16} />
            Em Alta
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-sm"
          >
            <Clock size={16} />
            Recentes
          </Button>
        </div>

        {/* Profile section */}
        <div className="space-y-0.5">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-sm"
          >
            <User size={16} />
            Perfil
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-sm"
          >
            <Settings size={16} />
            Configurações
          </Button>
        </div>
      </div>
    </div>
  );
}
