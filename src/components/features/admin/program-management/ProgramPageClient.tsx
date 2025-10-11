// src/components/features/admin/program-management/ProgramPageClient.tsx

"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { ProgramForm } from "./ProgramForm";
import { Button } from "@/src/components/ui/button";
import { Category, Program, ProgramWithRelations } from "@/src/lib/types";
import { PlusCircle } from "lucide-react";
import { useToast } from "@/src/hooks/use-toast";
import { ConfirmationDialog } from "@/src/components/ui/confirmation-dialog";
import { ProgramCard } from "./program-card";
import { useProgramManager } from "./useProgramManager"; // Importamos nosso novo hook
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/src/components/ui/pagination";
import { Skeleton } from "@/src/components/ui/skeleton";

// O componente agora só precisa receber as categorias para o formulário
export default function ProgramPageClient({
  categories,
}: {
  categories: Category[];
}) {
  const {
    programs,
    loading,
    currentPage,
    totalCount,
    itemsPerPage,
    fetchData,
    handlePageChange,
  } = useProgramManager();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProgram, setEditingProgram] =
    useState<ProgramWithRelations | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingProgram, setDeletingProgram] =
    useState<ProgramWithRelations | null>(null);
  const { toast } = useToast();

  const handleEdit = (program: ProgramWithRelations) => {
    setEditingProgram(program);
    setIsFormOpen(true);
  };

  const handleDeleteRequest = (program: ProgramWithRelations) => {
    setDeletingProgram(program);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (deletingProgram) {
      // Usaremos a Server Action diretamente aqui no futuro, por enquanto o console.log está ok
      console.log("Deletar programa:", deletingProgram?.id);
      setIsDeleteDialogOpen(false);
      // Aqui chamaríamos a action de deletar e depois o fetchData()
    }
  };

  const handleSuccess = (program: Program) => {
    setIsFormOpen(false);
    setEditingProgram(null);
    fetchData(); // Recarrega os dados da página atual após salvar
    toast({ title: "Sucesso!", description: "Programa salvo." });
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingProgram(null);
  };

  const handleAddNew = () => {
    setEditingProgram(null);
    setIsFormOpen(true);
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Gerenciar Programas</h1>
        <Button onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar Programa
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
          {[...Array(itemsPerPage)].map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <Skeleton className="h-[150px] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
          {programs.map((program) => (
            <ProgramCard
              key={program.id}
              program={program}
              onEdit={handleEdit}
              onDelete={handleDeleteRequest}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) handlePageChange(currentPage - 1);
                }}
                className={
                  currentPage === 1 ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>
            <PaginationItem>
              <span className="px-4 text-sm font-medium">
                Página {currentPage} de {totalPages}
              </span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages)
                    handlePageChange(currentPage + 1);
                }}
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingProgram ? "Editar Programa" : "Adicionar Novo Programa"}
            </DialogTitle>
          </DialogHeader>
          <ProgramForm
            program={editingProgram}
            categories={categories}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Confirmar Exclusão"
        description={`Tem certeza que deseja deletar o programa "${deletingProgram?.title}"?`}
      />
    </div>
  );
}
