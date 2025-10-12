"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { DialogOverlay } from "@/src/components/ui/dialog-overlay";
import { Button } from "@/src/components/ui/button";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { toast } from "@/src/lib/safe-toast";
import { Episode } from "@/src/lib/types";

interface EpisodeJsonDialogProps {
  episode: Episode | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Exibir JSON "compacto" (sem pretty print)? Default false
   */
  compact?: boolean;
}

export function EpisodeJsonDialog({
  episode,
  open,
  onOpenChange,
  compact = false,
}: EpisodeJsonDialogProps) {
  const json = React.useMemo(
    () =>
      episode
        ? compact
          ? JSON.stringify(episode)
          : JSON.stringify(episode, null, 2)
        : "",
    [episode, compact]
  );

  const handleCopy = async () => {
    if (!json) return;
    try {
      await navigator.clipboard.writeText(json);
      toast.success("JSON copiado para a área de transferência");
    } catch {
      toast.error("Falha ao copiar JSON");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Overlay aplicado aqui */}
      <DialogOverlay />
      <DialogContent
        className="max-w-2xl data-[state=open]:animate-in data-[state=closed]:animate-out"
        onOpenAutoFocus={(e) => {
          // Evita focar automaticamente em botões e “pular” a rolagem inicial
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Dados do Episódio</DialogTitle>
          <DialogDescription>
            Representação completa do objeto em memória (somente leitura).
          </DialogDescription>
        </DialogHeader>

        <div className="border rounded-md bg-muted/30">
          <ScrollArea className="h-[420px] p-4">
            <pre className="text-xs whitespace-pre-wrap break-words font-mono leading-relaxed">
              {json}
            </pre>
          </ScrollArea>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleCopy} disabled={!json}>
            Copiar JSON
          </Button>
          <Button onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
