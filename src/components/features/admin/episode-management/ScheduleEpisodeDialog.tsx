// Em um novo arquivo, ex: src/components/features/admin/episode-management/schedule-episode-dialog.tsx

"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Calendar } from "@/src/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { scheduleEpisode } from "@/src/app/admin/episodes/actions";
import { toast } from "sonner";

interface ScheduleEpisodeDialogProps {
  episodeId: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function ScheduleEpisodeDialog({
  episodeId,
  isOpen,
  onOpenChange,
}: ScheduleEpisodeDialogProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const handleSchedule = async () => {
    if (!date) {
      toast.error("Por favor, selecione uma data.");
      return;
    }

    const result = await scheduleEpisode(episodeId, date.toISOString());

    if (result.success) {
      toast.success(result.success);
      onOpenChange(false);
    } else {
      toast.error(result.error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agendar Episódio</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSchedule}>Confirmar Agendamento</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
