import { Card, CardContent } from "../ui/card";
import {
  Monitor,
  GraduationCap,
  Heart,
  Briefcase,
  Atom,
  Palette,
} from "lucide-react";
import Link from "next/link";

const categories = [
  {
    name: "Tecnologia",
    icon: Monitor,
    description: "IA, programação, inovação",
    episodeCount: 245,
    color: "bg-blue-500",
  },
  {
    name: "Educação",
    icon: GraduationCap,
    description: "Aprendizado, métodos, ensino",
    episodeCount: 189,
    color: "bg-green-500",
  },
  {
    name: "Saúde",
    icon: Heart,
    description: "Bem-estar, medicina, fitness",
    episodeCount: 156,
    color: "bg-red-500",
  },
  {
    name: "Negócios",
    icon: Briefcase,
    description: "Empreendedorismo, gestão",
    episodeCount: 134,
    color: "bg-purple-500",
  },
  {
    name: "Ciência",
    icon: Atom,
    description: "Física, química, biologia",
    episodeCount: 98,
    color: "bg-orange-500",
  },
  {
    name: "Arte & Cultura",
    icon: Palette,
    description: "História, filosofia, arte",
    episodeCount: 87,
    color: "bg-pink-500",
  },
];

export function CategoryGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {categories.map((category) => (
        <Link
          key={category.name}
          href={`/category/${category.name.toLowerCase()}`}
        >
          <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer">
            <CardContent className="p-4 text-center">
              <div
                className={`${category.color} w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3`}
              >
                <category.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-1">{category.name}</h3>
              <p className="text-xs text-muted-foreground mb-2">
                {category.description}
              </p>
              <p className="text-xs font-medium">
                {category.episodeCount} episódios
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
