"use client";

import { useState, useTransition, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { toast } from "sonner";

interface ScheduleEpisodeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  episodeId: string;
  episodeTitle: string;
  // Callback fornecido pelo EpisodeManager para aplicar o agendamento
  // Recebe o episodeId e a data/hora em ISO
  onConfirm?: (episodeId: string, publishAtISO: string) => Promise<void> | void;
  // Opcional: valor inicial
  defaultDateISO?: string;
}

export function ScheduleEpisodeDialog({
  isOpen,
  onOpenChange,
  episodeId,
  episodeTitle,
  onConfirm,
  defaultDateISO,
}: ScheduleEpisodeDialogProps) {
  const [publishAt, setPublishAt] = useState<string>(defaultDateISO ?? "");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    // Limpa ou seta o valor inicial ao abrir
    if (isOpen) {
      setPublishAt(defaultDateISO ?? "");
    }
  }, [isOpen, defaultDateISO]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!publishAt) {
      toast.error("Selecione uma data/hora válida.");
      return;
    }
    if (!onConfirm) {
      toast.error("Função de agendamento indisponível.");
      return;
    }

    // Dispara via transition para alinhar prioridade de renderização
    startTransition(async () => {
      try {
        await onConfirm(episodeId, publishAt);
        onOpenChange(false);
      } catch (err: any) {
        toast.error(err?.message || "Erro ao agendar.");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent aria-busy={isPending}>
        <DialogHeader>
          <DialogTitle>Agendar publicação</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {episodeTitle ? `Episódio: ${episodeTitle}` : ""}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="publishAt" className="text-sm font-medium">
              Data e hora de publicação
            </label>
            <Input
              id="publishAt"
              type="datetime-local"
              value={publishAt}
              onChange={(e) => setPublishAt(e.target.value)}
              disabled={isPending}
              required
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Agendando..." : "Agendar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
