"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { useToast } from "@/src/hooks/use-toast";
import { Program, Category } from "@/src/lib/types";
import { ProgramTable } from "./ProgramTable";
import { ProgramForm } from "./ProgramForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { deleteProgram } from "@/src/app/admin/programs/actions";
import { ConfirmationDialog } from "@/src/components/ui/confirmation-dialog";

interface ProgramPageClientProps {
  initialPrograms: Program[];
  categories: Category[];
}

export function ProgramPageClient({
  initialPrograms,
  categories,
}: ProgramPageClientProps) {
  const [programs, setPrograms] = useState<Program[]>(initialPrograms);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const { toast } = useToast();

  const handleSuccess = (updatedProgram: Program) => {
    if (selectedProgram) {
      // Edit
      setPrograms(
        programs.map((p) => (p.id === updatedProgram.id ? updatedProgram : p))
      );
    } else {
      // Create
      setPrograms([updatedProgram, ...programs]);
    }
    setIsFormOpen(false);
    setSelectedProgram(null);
  };

  const handleAddNew = () => {
    setSelectedProgram(null);
    setIsFormOpen(true);
  };

  const handleEdit = (program: Program) => {
    setSelectedProgram(program);
    setIsFormOpen(true);
  };

  const handleDelete = (program: Program) => {
    setSelectedProgram(program);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedProgram) return;

    const result = await deleteProgram(selectedProgram.id);

    if (result.success) {
      setPrograms(programs.filter((p) => p.id !== selectedProgram.id));
      toast({ description: result.message });
    } else {
      toast({ description: result.message, variant: "destructive" });
    }

    setIsDeleteDialogOpen(false);
    setSelectedProgram(null);
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gerenciar Programas</h1>
        <Button onClick={handleAddNew}>Adicionar Novo Programa</Button>
      </div>

      <ProgramTable
        programs={programs}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedProgram ? "Editar Programa" : "Novo Programa"}
            </DialogTitle>
          </DialogHeader>
          <ProgramForm
            program={selectedProgram}
            categories={categories}
            onSuccess={handleSuccess}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <ConfirmationDialog 
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Confirmar Exclusão"
        description={`Tem certeza que deseja deletar o programa "${selectedProgram?.title}"? Todos os episódios associados também serão removidos.`}
      />
    </div>
  );
}
