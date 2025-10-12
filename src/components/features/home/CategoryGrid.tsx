"use client";

import {
  BookOpen,
  Brain,
  Code,
  Gavel,
  Heart,
  Lightbulb,
  Mic,
  Music,
  Palette,
  PenTool,
  TrendingUp,
  Zap,
} from "lucide-react";
import { cn } from "@/src/lib/utils";

// Tipagem para uma categoria
type Category = {
  id: number;
  name: string;
  color: string;
  icon: React.ReactNode;
  episodeCount: number;
};

// Dados estáticos das categorias
const categories: Category[] = [
  {
    id: 1,
    name: "Estudos Bíblicos",
    color: "bg-gradient-to-br from-amber-500 via-orange-600 to-red-600",
    icon: <BookOpen className="h-6 w-6" />,
    episodeCount: 24,
  },
  {
    id: 2,
    name: "Tecnologia",
    color: "bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600",
    icon: <Code className="h-6 w-6" />,
    episodeCount: 18,
  },
  {
    id: 3,
    name: "Filosofia",
    color: "bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600",
    icon: <Brain className="h-6 w-6" />,
    episodeCount: 15,
  },
  {
    id: 4,
    name: "Negócios",
    color: "bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600",
    icon: <TrendingUp className="h-6 w-6" />,
    episodeCount: 22,
  },
  {
    id: 5,
    name: "Psicologia",
    color: "bg-gradient-to-br from-pink-500 via-rose-600 to-red-600",
    icon: <Heart className="h-6 w-6" />,
    episodeCount: 19,
  },
  {
    id: 6,
    name: "Direito",
    color: "bg-gradient-to-br from-slate-500 via-slate-600 to-gray-700",
    icon: <Gavel className="h-6 w-6" />,
    episodeCount: 12,
  },
  {
    id: 7,
    name: "Criatividade",
    color: "bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500",
    icon: <Lightbulb className="h-6 w-6" />,
    episodeCount: 16,
  },
  {
    id: 8,
    name: "Arte",
    color: "bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-500",
    icon: <Palette className="h-6 w-6" />,
    episodeCount: 14,
  },
  {
    id: 9,
    name: "Escrita",
    color: "bg-gradient-to-br from-teal-500 via-green-600 to-emerald-600",
    icon: <PenTool className="h-6 w-6" />,
    episodeCount: 11,
  },
];

// Componente de Card de Categoria
function CategoryCard({
  category,
  onClick,
}: {
  category: Category;
  onClick: () => void;
}) {
  return (
    <div
      className="group relative cursor-pointer overflow-hidden rounded-xl bg-white/10 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-white/15 dark:bg-white/5"
      onClick={onClick}
    >
      <div className="relative z-10 flex h-32 flex-col items-center justify-center p-4 text-center">
        <div
          className={cn(
            "mb-3 flex h-14 w-14 items-center justify-center rounded-xl shadow-lg transition-all duration-300 group-hover:scale-110",
            category.color
          )}
        >
          <div className="text-white">{category.icon}</div>
        </div>
        <h3 className="text-sm font-bold leading-tight text-foreground transition-colors duration-300 sm:text-base">
          {category.name}
        </h3>
        <p className="mt-1 text-xs font-medium text-muted-foreground">
          {category.episodeCount} episódios
        </p>
      </div>

      {/* Efeito de brilho ao passar o mouse */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </div>
  );
}

export function CategoryGrid() {
  const handleCategoryClick = (categoryId: number) => {
    console.log(`Clicou na categoria ${categoryId}`);
    // Aqui você pode adicionar a lógica de navegação para a página da categoria
  };

  return (
    <section className="py-8">
      <div className="container">
        <div className="mb-6 px-1 sm:px-0">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-xl font-bold text-transparent md:text-2xl">
                Explore por Categorias
              </h2>
              <p className="mt-1 text-xs font-medium text-muted-foreground md:text-sm">
                Descubra novos conteúdos organizados por temas
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onClick={() => handleCategoryClick(category.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
