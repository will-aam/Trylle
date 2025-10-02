// src/app/admin/programs/page.tsx
import { getPrograms } from "@/src/services/programService";
import { getCategories } from "@/src/services/categoryService";
import { ProgramPageClient } from "@/src/components/features/admin/program-management/ProgramPageClient";

export const dynamic = "force-dynamic";

export default async function AdminProgramsPage() {
  const programs = await getPrograms();
  const categories = await getCategories();

  return (
    <ProgramPageClient initialPrograms={programs} categories={categories} />
  );
}
