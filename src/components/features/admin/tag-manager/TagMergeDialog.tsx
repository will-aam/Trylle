"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../ui/alert-dialog";
import { Badge } from "../../../ui/badge";
import { TagWithCount } from "./types";

interface TagMergeDialogProps {
  selectedTags: TagWithCount[];
  mainTag: TagWithCount | null;
  isOpen: boolean;
  onClose: () => void;
  onMainTagChange: (tag: TagWithCount) => void;
  onMerge: () => void;
}

export function TagMergeDialog({
  selectedTags,
  mainTag,
  isOpen,
  onClose,
  onMainTagChange,
  onMerge,
}: TagMergeDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Mesclar Tags</AlertDialogTitle>
          <AlertDialogDescription>
            Selecione a tag principal que será mantida. As outras tags serão
            excluídas e todos os episódios que as usavam serão atualizados para
            usar a tag principal.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Tags selecionadas:
            </label>
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tag) => (
                <Badge key={tag.id} variant="secondary">
                  {tag.name} ({tag.episode_count})
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">
              Tag principal:
            </label>
            <select
              className="w-full p-2 border rounded-md"
              value={mainTag?.id || ""}
              onChange={(e) => {
                const selected = selectedTags.find(
                  (tag) => tag.id === e.target.value
                );
                if (selected) onMainTagChange(selected);
              }}
            >
              <option value="">Selecione uma tag</option>
              {selectedTags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onMerge} disabled={!mainTag}>
            Mesclar Tags
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
