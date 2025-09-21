"use client";

import { Button } from "@/src/components/ui/button";
import { Check, X, Send, FileText } from "lucide-react";

interface EpisodeBulkActionsProps {
  selectedCount: number;
  onPublish: () => void;
  onMoveToDraft: () => void;
  onClearSelection: () => void;
}

export function EpisodeBulkActions({
  selectedCount,
  onPublish,
  onMoveToDraft,
  onClearSelection,
}: EpisodeBulkActionsProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
      <div className="flex items-center gap-4">
        <div className="text-sm font-medium">
          <span className="font-bold text-primary">{selectedCount}</span>{" "}
          {selectedCount > 1
            ? "episódios selecionados"
            : "episódio selecionado"}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onPublish}>
          <Send className="mr-2 h-4 w-4" />
          Publicar
        </Button>
        <Button variant="ghost" size="sm" onClick={onMoveToDraft}>
          <FileText className="mr-2 h-4 w-4" />
          Mover para Rascunho
        </Button>
        <Button variant="ghost" size="sm" onClick={onClearSelection}>
          <X className="mr-2 h-4 w-4" />
          Limpar Seleção
        </Button>
      </div>
    </div>
  );
}
