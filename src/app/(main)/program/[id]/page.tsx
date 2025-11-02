// src/app/(main)/program/[id]/page.tsx

import { notFound } from "next/navigation";
// 1. DESCOMENTE AS IMPORTAÇÕES
import { getProgramWithEpisodes } from "@/src/services/programService";
import { ProgramHeader } from "@/src/components/features/program/ProgramHeader";
import { EpisodeList } from "@/src/components/features/program/EpisodeList";
import { ProgramWithRelations } from "@/src/lib/types"; // Precisamos do tipo completo

// Tipos para os parâmetros da página
interface ProgramPageProps {
  params: {
    id: string;
  };
}

// A página é um Server Component assíncrono
export default async function ProgramPage({ params }: ProgramPageProps) {
  const { id } = params;

  // 2. DESCOMENTE A LÓGICA DE BUSCA DE DADOS
  const programData = (await getProgramWithEpisodes(
    id
  )) as ProgramWithRelations | null; // Usamos o tipo correto

  if (!programData) {
    notFound(); // Se não achar o programa, mostra página 404
  }

  // Separamos os episódios do resto dos dados do programa
  const { episodes, ...program } = programData;

  // 3. SUBSTITUA O CONTEÚDO DO RETURN
  return (
    // Container principal com padding e largura máxima
    <div className="container mx-auto max-w-4xl p-4 md:p-6">
      {/* Nosso novo componente de Header */}
      <ProgramHeader program={program} />

      {/* Nossa nova lista de episódios */}
      <div className="mt-8 md:mt-12">
        <EpisodeList episodes={episodes || []} />
      </div>
    </div>
  );
}
