// src/components/features/admin/program-management/ProgramPageClient.tsx

"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { ProgramForm } from "@/src/components/features/admin/program-management/ProgramForm";
import { Button } from "@/src/components/ui/button";
import { Category, Program, ProgramWithRelations } from "@/src/lib/types";
import { PlusCircle } from "lucide-react";
import { useToast } from "@/src/hooks/use-toast";
import { ConfirmationDialog } from "@/src/components/ui/confirmation-dialog";
import { ProgramCard } from "@/src/components/features/admin/program-management/program-card";

interface ProgramPageClientProps {
  programs: ProgramWithRelations[];
  categories: Category[];
}

export default function ProgramPageClient({
  programs,
  categories,
}: ProgramPageClientProps) {
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
    // A Server Action já está no seu programService, não precisamos importar de actions
    // if (deletingProgram) {
    //   const result = await deleteProgramAction(deletingProgram.id);
    //   if (result.success) {
    //     toast({ description: result.message });
    //   } else {
    //     toast({ description: result.message, variant: "destructive" });
    //   }
    // }
    console.log("Deletar programa:", deletingProgram?.id);
    // A lógica de deleção que você já tem funcionará aqui
  };

  const handleSuccess = (program: Program) => {
    setIsFormOpen(false);
    setEditingProgram(null);
    // A página será recarregada pela Server Action, então o toast já é suficiente
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingProgram(null);
  };

  const handleAddNew = () => {
    setEditingProgram(null);
    setIsFormOpen(true);
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Gerenciar Programas</h1>
        <Button onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar Programa
        </Button>
      </div>

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

      {/* ProgramForm agora está dentro de um Dialog */}
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

      {/* ConfirmationDialog com a prop correta: isOpen */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Confirmar Exclusão"
        description={`Tem certeza que deseja deletar o programa "${deletingProgram?.title}"? Esta ação não pode ser desfeita.`}
      />
    </div>
  );
}
