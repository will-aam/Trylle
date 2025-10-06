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
import { Button } from "@/src/components/ui/button";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { toast } from "sonner";
import { Episode } from "@/src/lib/types";

interface EpisodeJsonDialogProps {
  episode: Episode | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EpisodeJsonDialog({
  episode,
  open,
  onOpenChange,
}: EpisodeJsonDialogProps) {
  const json = React.useMemo(
    () => (episode ? JSON.stringify(episode, null, 2) : ""),
    [episode]
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(json);
      toast.success("JSON copiado para a área de transferência");
    } catch {
      toast.error("Falha ao copiar JSON");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Dados do Episódio</DialogTitle>
          <DialogDescription>
            Representação JSON completa do objeto em memória.
          </DialogDescription>
        </DialogHeader>
        <div className="border rounded-md bg-muted/30">
          <ScrollArea className="h-[420px] p-4">
            <pre className="text-xs whitespace-pre-wrap break-all font-mono leading-relaxed">
              {json}
            </pre>
          </ScrollArea>
        </div>
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleCopy}>
            Copiar JSON
          </Button>
          <Button onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
