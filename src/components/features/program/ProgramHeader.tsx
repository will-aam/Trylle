// src/components/features/program/ProgramHeader.tsx

import Image from "next/image";
import { AspectRatio } from "@/src/components/ui/aspect-ratio";
import { Badge } from "@/src/components/ui/badge";
import { Program, Category } from "@/src/lib/types";
import { ImageIcon } from "lucide-react";

// Definimos o tipo de props que o componente espera.
// Usamos Pick para pegar só os campos do programa que precisamos.
// E ajustamos 'categories' para ser o objeto único que esperamos.
type ProgramHeaderProps = {
  program: Pick<
    Program,
    "title" | "description" | "image_url" | "categories"
  > & {
    categories: Category | null; // A query traz 'categories' (objeto) e não 'category'
  };
};

export function ProgramHeader({ program }: ProgramHeaderProps) {
  const { title, description, image_url, categories } = program;

  return (
    // Layout principal: flex-col no mobile, md:flex-row no desktop
    <div className="flex flex-col md:flex-row gap-6 md:gap-8">
      {/* Coluna da Imagem (Mobile: 100% de largura, Desktop: 1/3) */}
      <div className="w-full md:w-1/3 flex-shrink-0">
        <AspectRatio
          ratio={1 / 1} // Imagem quadrada, comum em apps de áudio
          className="overflow-hidden rounded-lg shadow-lg"
        >
          {image_url ? (
            <Image
              src={image_url}
              alt={title}
              fill
              className="object-cover"
              priority // Carrega a imagem principal com prioridade
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <ImageIcon className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
        </AspectRatio>
      </div>

      {/* Coluna de Texto (Mobile: 100% de largura, Desktop: 2/3) */}
      <div className="flex flex-col justify-center gap-3 w-full md:w-2/3">
        {/* Categoria */}
        {categories?.name && (
          <Badge variant="secondary" className="w-fit">
            {categories.name}
          </Badge>
        )}

        {/* Título */}
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          {title}
        </h1>

        {/* Descrição */}
        {description && (
          <p className="text-base text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}
