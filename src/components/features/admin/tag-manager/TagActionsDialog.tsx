"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { TagGroup, TagWithCount } from "./types";

export interface TagActionsDialogProps {
  tag: TagWithCount | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (
    tagId: string,
    newName: string,
    groupId: string | null
  ) => void | Promise<void>;
  onDelete: (tagId: string) => void | Promise<void>;
  tagGroups: TagGroup[];
  // Novas props opcionais (controle externo)
  editTagName?: string;
  onEditTagNameChange?: (value: string) => void;
}

export function TagActionsDialog({
  tag,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  tagGroups,
  editTagName,
  onEditTagNameChange,
}: TagActionsDialogProps) {
  // Estado interno fallback se controle externo não foi fornecido
  const [internalName, setInternalName] = useState("");
  const [groupId, setGroupId] = useState<string | null>(null);

  const controlled = typeof editTagName === "string" && !!onEditTagNameChange;

  useEffect(() => {
    if (tag) {
      if (!controlled) {
        setInternalName(tag.name);
      }
      setGroupId(tag.group_id || null);
    } else {
      if (!controlled) setInternalName("");
      setGroupId(null);
    }
  }, [tag, controlled, editTagName]);

  const currentName = controlled ? editTagName! : internalName;

  const handleNameChange = (val: string) => {
    if (controlled) {
      onEditTagNameChange!(val);
    } else {
      setInternalName(val);
    }
  };

  if (!isOpen || !tag) return null;

  const handleEdit = async () => {
    if (!currentName.trim()) return;
    await onEdit(tag.id, currentName.trim(), groupId);
  };

  const handleDelete = async () => {
    await onDelete(tag.id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Editar Tag</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome da Tag</label>
            <Input
              value={currentName}
              onChange={(e) => handleNameChange(e.target.value)}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Vinculada a {tag.episode_count} episódio(s).
            </p>
          </div>

          {tagGroups.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Grupo (opcional)</label>
              <select
                className="border rounded-md h-9 px-2 text-sm bg-background"
                value={groupId || ""}
                onChange={(e) => setGroupId(e.target.value || null)}
              >
                <option value="">Sem grupo</option>
                {tagGroups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-between pt-2">
            <Button variant="destructive" type="button" onClick={handleDelete}>
              Excluir
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" type="button" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleEdit}
                disabled={!currentName.trim()}
              >
                Salvar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
