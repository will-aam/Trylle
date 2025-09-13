"use client";
import { Button } from "../../../ui/button";
import { Upload, Download, Trash2 } from "lucide-react";
import { FileInput } from "./FileInput";
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
} from "../../../ui/alert-dialog";

interface TagBulkActionsProps {
  unusedTagCount: number;
  onDeleteUnusedTags: () => void;
  onImportTags: () => void;
  onExportTags: () => void;
}

export function TagBulkActions({
  unusedTagCount,
  onDeleteUnusedTags,
  onImportTags,
  onExportTags,
}: TagBulkActionsProps) {
  return (
    <div className="flex space-x-2">
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
