"use client";

import { Button } from "@/src/components/ui/button";
import { ScrollArea } from "@/src/components/ui/scroll-area";
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
    <div className="w-48 bg-card border-r border-border h-screen flex flex-col justify-between">
      {" "}
      {/* Navigation */}
      <div className="p-3 space-y-1">
        <Link href="/">
          <Button variant="ghost" className="w-full justify-start gap-2">
            <span className="bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent text-sm">
              Sugerir Episódio
            </span>
          </Button>
        </Link>
        <Button variant="ghost" className="w-full justify-start gap-2 text-sm">
          <Search size={16} />
          Buscar
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-2 text-sm">
          <Library size={16} />
          Sua Biblioteca
        </Button>
      </div>
      <div className="border-t border-border my-1" />
      {/* Playlists */}
      <div className="p-3 space-y-1">
        <Button variant="ghost" className="w-full justify-start gap-2 text-sm">
          <Plus size={16} />
          Criar Playlist
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-2 text-sm">
          <Heart size={16} />
          Curtidos
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-2 text-sm">
          <Download size={16} />
          Downloads
        </Button>
      </div>
      <div className="border-t border-border my-1" />
      {/* Categories */}
      <ScrollArea className="flex-1 p-2">
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
      </ScrollArea>
      {/* User Profile */}
      <div className="p-2 border-t border-border">
        <Button variant="ghost" className="w-full justify-start gap-2 text-sm">
          <User size={16} />
          Perfil
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-2 text-sm">
          <Settings size={16} />
          Configurações
        </Button>
      </div>
    </div>
  );
}
