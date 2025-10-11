// src/app/admin/programs/page.tsx

import {
  getCategories,
  getProgramsWithRelations,
} from "@/src/services/programService";
import ProgramPageClient from "@/src/components/features/admin/program-management/ProgramPageClient";

export const revalidate = 0;

export default async function AdminProgramsPage() {
  const programs = await getProgramsWithRelations();
  const categories = await getCategories();

  return <ProgramPageClient programs={programs} categories={categories} />;
}
