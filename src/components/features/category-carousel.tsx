"use client";

import * as React from "react";
import { Card } from "@/src/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  useCarousel,
} from "@/src/components/ui/carousel";
import {
  Mic,
  Music,
  Cpu,
  BookOpen,
  Newspaper,
  Laugh,
  type LucideIcon,
  Smartphone,
  Globe,
  HardDrive,
  Guitar,
  MicVocal,
  Podcast,
  FlaskConical,
  Landmark,
  Brain,
  Rocket,
  Palette,
  Camera,
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
  {
    id: "1",
    name: "Tecnologia",
    subcategories: [{ name: "Mobile, Web Dev, Hardware" }],
  },
  {
    id: "2",
    name: "Música",
    subcategories: [{ name: "Rock, Pop, Indie" }],
  },
  {
    id: "3",
    name: "Entrevistas",
    subcategories: [{ name: "Artistas, Cientistas, Empreendedores" }],
  },
  {
    id: "4",
    name: "Educacional",
    subcategories: [{ name: "Ciência, História, Filosofia" }],
  },
  {
    id: "5",
    name: "Notícias",
    subcategories: [{ name: "Tech, Cultura, Mundo" }],
  },
  {
    id: "6",
    name: "Comédia",
    subcategories: [{ name: "Stand-up, Entrevistas, Esquetes" }],
  },
];

const CategoryCard = ({
  category,
  isSelected = true,
}: {
  category: (typeof mockCategories)[0];
  isSelected?: boolean;
}) => {
  const style = categoryStyles[category.name] || categoryStyles.Default;
  const Icon = style.icon;

  return (
    <Card
      className={`rounded-lg overflow-hidden flex flex-col items-center justify-center text-center p-4 transition-all duration-300 ease-in-out ${
        isSelected ? "opacity-100 scale-100" : "opacity-50 scale-90"
      }`}
    >
      <div
        className={`aspect-square w-16 h-16 rounded-full flex items-center justify-center ${style.color}`}
      >
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-card-foreground">
        {category.name}
      </h3>
      <div className="mt-4 pt-4 border-t w-full space-y-2">
        {category.subcategories.map((subcategory) => (
          <div
            key={subcategory.name}
            className="flex items-center gap-2 justify-center"
          >
            <span className="text-xs text-muted-foreground">
              {subcategory.name}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};

const CarouselCategoryCard = ({
  category,
  index,
}: {
  category: (typeof mockCategories)[0];
  index: number;
}) => {
  const { api } = useCarousel();
  const [isSelected, setIsSelected] = React.useState(false);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    const onSelect = () => {
      setIsSelected(api.selectedScrollSnap() === index);
    };

    api.on("select", onSelect);
    // Set initial state
    onSelect();

    return () => {
      api.off("select", onSelect);
    };
  }, [api, index]);

  return <CategoryCard category={category} isSelected={isSelected} />;
};

export function CategoryCarousel() {
  return (
    <>
      {/* Versão Carrossel para Telas Pequenas */}
      <div className="md:hidden">
        <Carousel
          opts={{
            align: "center",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {mockCategories.map((category, index) => (
              <CarouselItem key={category.id} className="basis-[80%]">
                <CarouselCategoryCard category={category} index={index} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-0" />
          <CarouselNext className="absolute right-0" />
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
