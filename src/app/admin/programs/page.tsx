// src/app/admin/programs/page.tsx

import { getCategories } from "@/src/services/programService";
import ProgramPageClient from "@/src/components/features/admin/program-management/ProgramPageClient";

export const revalidate = 0;

export default async function AdminProgramsPage() {
  const categories = await getCategories();

  return <ProgramPageClient categories={categories} />;
}
