"use client";

import { Button } from "@/src/components/ui/button";
import { X, Send, FileText, Loader2 } from "lucide-react";

interface EpisodeBulkActionsProps {
  selectedCount: number;
  isLoading: boolean;
  onPublish: () => void;
  onMoveToDraft: () => void;
  onClearSelection: () => void;
}

export function EpisodeBulkActions({
  selectedCount,
  isLoading,
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
        <Button
          variant="ghost"
          size="sm"
          onClick={onPublish}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Send className="mr-2 h-4 w-4" />
          )}
          Publicar
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onMoveToDraft}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FileText className="mr-2 h-4 w-4" />
          )}
          Mover para Rascunho
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          disabled={isLoading}
        >
          <X className="mr-2 h-4 w-4" />
          Limpar Seleção
        </Button>
      </div>
    </div>
  );
}
