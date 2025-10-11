// src/components/features/admin/program-management/program-card.tsx

"use client";

import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { ProgramWithRelations } from "@/src/lib/types";
import { cn } from "@/src/lib/utils";
import { Calendar, Edit, Trash2, Eye, EyeOff, Ellipsis } from "lucide-react"; // 1. IMPORTADO O ÍCONE
import { useState, useRef, useEffect } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";

interface ProgramCardProps {
  program: ProgramWithRelations;
  onEdit: (program: ProgramWithRelations) => void;
  onDelete: (program: ProgramWithRelations) => void;
}

export function ProgramCard({ program, onEdit, onDelete }: ProgramCardProps) {
  const colorTheme = program.categories?.color_theme || "default";
  const gradientClass = `gradient-${colorTheme}`;
  const episodeCount = program._count?.episodes ?? 0;

  const [isVisible, setIsVisible] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="group flex flex-col">
      <Card className="flex flex-col flex-grow overflow-hidden border-slate-700 bg-slate-800 text-white transition-transform duration-300 group-hover:scale-[1.02]">
        <div
          className={cn(
            "relative aspect-video cursor-pointer overflow-hidden",
            gradientClass
          )}
        >
          <div className="pattern rings">
            <div className="deco-ring deco-ring-1"></div>
            <div className="deco-ring deco-ring-2"></div>
            <div className="deco-ring deco-ring-3"></div>
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent transition-colors group-hover:from-black/40"></div>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/95 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-white">
              <div className="ml-1 h-0 w-0 border-b-[14px] border-l-[22px] border-t-[14px] border-b-transparent border-t-transparent border-l-slate-900"></div>
            </div>
          </div>
        </div>

        <CardContent className="flex-grow p-4">
          <h3 className="text-xs font-medium uppercase tracking-wider text-slate-400">
            {program.categories?.name || "Sem Categoria"}
          </h3>
          <h4 className="mt-1 line-clamp-2 h-[48px] font-semibold text-slate-50">
            {program.title}
          </h4>
          <p className="mt-2 text-sm text-slate-400">
            Série • {episodeCount}{" "}
            {episodeCount === 1 ? "episódio" : "episódios"}
          </p>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end px-2 pt-3">
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative cursor-pointer text-slate-400 hover:bg-slate-700/50 hover:text-slate-400"
                onClick={() => setIsVisible(!isVisible)}
              >
                <Eye
                  className={cn(
                    "absolute h-5 w-5 transition-opacity",
                    isVisible ? "opacity-100" : "opacity-0"
                  )}
                />
                <EyeOff
                  className={cn(
                    "absolute h-5 w-5 transition-opacity",
                    !isVisible ? "opacity-100" : "opacity-0"
                  )}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isVisible ? "Visível" : "Oculto"} (Função em breve)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="relative" ref={menuRef}>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-rose-500 hover:bg-slate-700/50 hover:text-rose-500"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Ellipsis className="h-5 w-5" />
          </Button>

          {isMenuOpen && (
            <div className="absolute bottom-[calc(100%+0.5rem)] right-0 z-10 w-40 overflow-hidden rounded-lg bg-slate-700 py-2 shadow-lg">
              <ul className="flex flex-col">
                <li>
                  <button
                    className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-slate-300 opacity-50"
                    disabled
                  >
                    <Calendar className="h-4 w-4" /> Agendar
                  </button>
                </li>
                <li>
                  <button
                    className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-white hover:bg-slate-600"
                    onClick={() => {
                      onEdit(program);
                      setIsMenuOpen(false);
                    }}
                  >
                    <Edit className="h-4 w-4 text-slate-400" /> Editar
                  </button>
                </li>
                <li>
                  <button
                    className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-rose-500 hover:bg-slate-600 hover:text-rose-400"
                    onClick={() => {
                      onDelete(program);
                      setIsMenuOpen(false);
                    }}
                  >
                    <Trash2 className="h-4 w-4" /> Deletar
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
