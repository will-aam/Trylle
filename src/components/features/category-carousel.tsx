"use client";

import { Card } from "@/src/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/src/components/ui/carousel";
import {
  Mic,
  Music,
  Cpu,
  BookOpen,
  Newspaper,
  Laugh,
  type LucideIcon,
} from "lucide-react";

const categoryStyles: { [key: string]: { icon: LucideIcon; color: string } } = {
  Tecnologia: { icon: Cpu, color: "bg-blue-500/20 text-blue-500" },
  Música: { icon: Music, color: "bg-pink-500/20 text-pink-500" },
  Entrevistas: { icon: Mic, color: "bg-green-500/20 text-green-500" },
  Educacional: { icon: BookOpen, color: "bg-yellow-500/20 text-yellow-500" },
  Notícias: { icon: Newspaper, color: "bg-red-500/20 text-red-500" },
  Comédia: { icon: Laugh, color: "bg-orange-500/20 text-orange-500" },
  Default: { icon: Mic, color: "bg-gray-500/20 text-gray-500" },
};

const mockCategories = [
  { id: "1", name: "Tecnologia" },
  { id: "2", name: "Música" },
  { id: "3", name: "Entrevistas" },
  { id: "4", name: "Educacional" },
  { id: "5", name: "Notícias" },
  { id: "6", name: "Comédia" },
];

const CategoryCard = ({
  category,
}: {
  category: { id: string; name: string };
}) => {
  const style = categoryStyles[category.name] || categoryStyles.Default;
  const Icon = style.icon;
  return (
    <Card className="rounded-lg overflow-hidden aspect-square flex flex-col items-center justify-center text-center p-4 transition-colors hover:bg-muted/50">
      <div
        className={`w-16 h-16 rounded-full flex items-center justify-center ${style.color}`}
      >
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-card-foreground">
        {category.name}
      </h3>
    </Card>
  );
};

export function CategoryCarousel() {
  return (
    <>
      {/* Versão Carrossel para Telas Pequenas */}
      <div className="md:hidden">
        <Carousel opts={{ align: "start", dragFree: true }} className="w-full">
          <CarouselContent className="-ml-2">
            {mockCategories.map((category) => (
              <CarouselItem key={category.id} className="basis-1/3 pl-2">
                <CategoryCard category={category} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      {/* Versão Grade para Telas Maiores */}
      <div className="hidden md:grid md:grid-cols-4 lg:grid-cols-6 gap-4">
        {mockCategories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </>
  );
}
