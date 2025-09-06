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
} from "lucide-react";

const categoryStyles: {
  [key: string]: {
    icon: LucideIcon;
    bgColor: string;
    textColor: string;
    hoverBg: string;
  };
} = {
  Tecnologia: {
    icon: Cpu,
    bgColor: "bg-blue-600",
    textColor: "text-white",
    hoverBg: "hover:bg-blue-700",
  },
  Entrevistas: {
    icon: Mic,
    bgColor: "bg-emerald-600",
    textColor: "text-white",
    hoverBg: "hover:bg-emerald-700",
  },
  Educacional: {
    icon: BookOpen,
    bgColor: "bg-amber-600",
    textColor: "text-white",
    hoverBg: "hover:bg-amber-700",
  },
  Notícias: {
    icon: Newspaper,
    bgColor: "bg-red-600",
    textColor: "text-white",
    hoverBg: "hover:bg-red-700",
  },
  Comédia: {
    icon: Laugh,
    bgColor: "bg-orange-600",
    textColor: "text-white",
    hoverBg: "hover:bg-orange-700",
  },
  Default: {
    icon: Mic,
    bgColor: "bg-slate-600",
    textColor: "text-white",
    hoverBg: "hover:bg-slate-700",
  },
};

const mockCategories = [
  {
    id: "1",
    name: "Tecnologia",
    subcategories: [{ name: "Mobile, Web Dev, Hardware" }],
  },
  {
    id: "2",
    name: "Entrevistas",
    subcategories: [{ name: "Artistas, Cientistas, Empreendedores" }],
  },
  {
    id: "3",
    name: "Educacional",
    subcategories: [{ name: "Ciência, História, Filosofia" }],
  },
  {
    id: "4",
    name: "Notícias",
    subcategories: [{ name: "Tech, Cultura, Mundo" }],
  },
  {
    id: "5",
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
      className={`group cursor-pointer rounded-xl overflow-hidden flex flex-col items-center justify-center text-center p-6 transition-all duration-300 ease-in-out border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${
        isSelected ? "opacity-100 scale-100" : "opacity-70 scale-95"
      }`}
    >
      <div
        className={`w-20 h-20 rounded-2xl flex items-center justify-center ${style.bgColor} ${style.textColor} ${style.hoverBg} transition-colors duration-300 shadow-md`}
      >
        <Icon className="h-10 w-10" />
      </div>
      <h3 className="mt-4 text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300">
        {category.name}
      </h3>
      <div className="mt-3 pt-3 border-t border-border/50 w-full">
        {category.subcategories.map((subcategory) => (
          <div
            key={subcategory.name}
            className="flex items-center justify-center"
          >
            <span className="text-sm text-muted-foreground leading-relaxed text-center">
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
      <div className="sm:hidden">
        <Carousel
          opts={{
            align: "center",
            loop: true,
          }}
          className="w-full px-4"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {mockCategories.map((category, index) => (
              <CarouselItem
                key={category.id}
                className="pl-2 md:pl-4 basis-[85%]"
              >
                <CarouselCategoryCard category={category} index={index} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2 bg-background/80 backdrop-blur-sm border-border/50" />
          <CarouselNext className="right-2 bg-background/80 backdrop-blur-sm border-border/50" />
        </Carousel>
      </div>

      <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6">
        {mockCategories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </>
  );
}
