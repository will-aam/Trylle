// src/app/admin/programs/page.tsx
import { getPrograms, getCategories } from "@/src/services/programService";
import { ProgramPageClient } from "@/src/components/features/admin/program-management/ProgramPageClient";

export const revalidate = 0;

export default async function AdminProgramsPage() {
  const programs = await getPrograms();
  const categories = await getCategories();

  return (
    <ProgramPageClient initialPrograms={programs} categories={categories} />
  );
}
