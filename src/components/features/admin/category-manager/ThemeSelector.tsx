// src/components/features/admin/category-manager/ThemeSelector.tsx

"use client";

import { cn } from "@/src/lib/utils";
import { Check } from "lucide-react";

const themes = [
  { name: "ocean", label: "Oceano" },
  { name: "twilight", label: "Crepúsculo" },
  { name: "sunset", label: "Pôr do Sol" },
  { name: "galaxy", label: "Galáxia" },
  { name: "candy", label: "Doce" },
  { name: "aurora", label: "Aurora" },
  { name: "citrus", label: "Cítrico" },
  { name: "ice", label: "Gelo" },
  { name: "mod", label: "Moderno" },
  { name: "mint", label: "Menta" },
  { name: "lavender", label: "Lavanda" },
  { name: "sky", label: "Céu" },
  { name: "fuchsia", label: "Fúcsia" },
  { name: "teal", label: "Verde-azulado" },
  { name: "rose", label: "Rosa" },
  { name: "violet", label: "Violeta" },
  { name: "cyan", label: "Ciano" },
  { name: "blue", label: "Azul" },
  { name: "emerald", label: "Esmeralda" },
  { name: "indigo", label: "Índigo" },
  { name: "purple", label: "Roxo" },
  { name: "pink", label: "Pink" },
  { name: "vaporwave", label: "Vaporwave" },
  { name: "pearl", label: "Pérola" },
  { name: "deep-sea", label: "Mar Profundo" },
];

interface ThemeSelectorProps {
  value?: string | null;
  onChange: (themeName: string) => void;
}

export function ThemeSelector({ value, onChange }: ThemeSelectorProps) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-slate-300">Tema do Card</p>
      <div className="grid grid-cols-5 gap-2">
        {themes.map((theme) => (
          <button
            key={theme.name}
            type="button"
            className={cn(
              "relative h-12 w-full rounded-md cursor-pointer transition-all duration-200",
              `gradient-${theme.name}`, // Aplica o gradiente
              value === theme.name
                ? "ring-2 ring-offset-2 ring-offset-slate-900 ring-white" // Estilo quando selecionado
                : "hover:scale-105" // Estilo no hover
            )}
            onClick={() => onChange(theme.name)}
            aria-label={`Selecionar tema ${theme.label}`}
          >
            {value === theme.name && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <Check className="h-6 w-6 text-white" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
