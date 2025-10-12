// src/components/features/admin/episode-management/schedule-episode-dialog.tsx

"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { toast } from "@/src/lib/safe-toast";

interface ScheduleEpisodeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  episodeId: string;
  episodeTitle: string;
  onConfirm: (episodeId: string, publishAtISO: string) => Promise<boolean>;
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
  const [publishAt, setPublishAt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const initialDate = defaultDateISO
        ? new Date(defaultDateISO)
        : new Date();
      initialDate.setMinutes(
        initialDate.getMinutes() - initialDate.getTimezoneOffset()
      );
      setPublishAt(initialDate.toISOString().slice(0, 16));
    }
  }, [isOpen, defaultDateISO]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!publishAt) {
      toast.error("Por favor, selecione uma data e hora.");
      return;
    }

    setIsSubmitting(true);
    const success = await onConfirm(
      episodeId,
      new Date(publishAt).toISOString()
    );
    setIsSubmitting(false);

    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agendar publicação</DialogTitle>
          <DialogDescription>Episódio: {episodeTitle}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="publishAt" className="text-sm font-medium">
              Data e hora
            </label>
            <Input
              id="publishAt"
              type="datetime-local"
              value={publishAt}
              onChange={(e) => setPublishAt(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Agendando..." : "Agendar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
