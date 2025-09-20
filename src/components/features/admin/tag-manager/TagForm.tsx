"use client";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";

interface TagFormProps {
  newTagName: string;
  onTagNameChange: (value: string) => void;
  onAddTag: () => void;
  unusedTagCount: number;
  onDeleteUnusedTags: () => void;
}

export function TagForm({
  newTagName,
  onTagNameChange,
  onAddTag,
  unusedTagCount,
  onDeleteUnusedTags,
}: TagFormProps) {
  const isDeleteDisabled = unusedTagCount === 0;

  return (
    <div className="flex w-full items-center space-x-2">
      <Input
        placeholder="Nome da nova tag"
        value={newTagName}
        onChange={(e) => onTagNameChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onAddTag()}
        className="flex-grow"
      />
      <Button onClick={onAddTag} type="button">
        <Plus className="mr-2 h-4 w-4" />
        Adicionar
      </Button>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {/* O AlertDialog precisa de um filho direto que possa aceitar um ref.
                Envolvemos o botão em um span para contornar a limitação quando o botão está desabilitado.
            */}
            <span tabIndex={isDeleteDisabled ? -1 : 0}>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="icon"
                    disabled={isDeleteDisabled}
                    className={`
                      ${isDeleteDisabled ? "cursor-not-allowed opacity-50" : ""}
                    `}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. Isso excluirá
                      permanentemente {unusedTagCount} tags que não estão
                      associadas a nenhum episódio.
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
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {isDeleteDisabled
                ? "Nenhuma tag não utilizada para limpar"
                : `Limpar ${unusedTagCount} tags não utilizadas`}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
