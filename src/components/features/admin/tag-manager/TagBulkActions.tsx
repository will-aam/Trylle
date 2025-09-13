"use client";
import { Button } from "@/src/components/ui/button";
import { Download, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/src/components/ui/alert-dialog";

interface TagBulkActionsProps {
  unusedTagCount: number;
  onDeleteUnusedTags: () => void;
  onExportTags: () => void;
}

export function TagBulkActions({
  unusedTagCount,
  onDeleteUnusedTags,
  onExportTags,
}: TagBulkActionsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Button variant="outline" onClick={onExportTags}>
        <Download className="mr-2 h-4 w-4" /> Exportar
      </Button>

      {unusedTagCount > 0 && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full sm:w-auto">
              <Trash2 className="mr-2 h-4 w-4" />
              Limpar {unusedTagCount} Tags Não Usadas
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Isso excluirá permanentemente{" "}
                {unusedTagCount} tags que não estão associadas a nenhum
                episódio.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={onDeleteUnusedTags}>
                Sim, excluir tags
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
