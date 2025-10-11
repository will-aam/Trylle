// src/components/features/admin/episode-management/schedule-episode-dialog.tsx

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
  DialogDescription,
} from "@/src/components/ui/dialog";
import { scheduleEpisode } from "@/src/app/admin/episodes/actions";
import { toast } from "sonner";

interface ScheduleEpisodeDialogProps {
  episodeId: string;
  episodeTitle: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function ScheduleEpisodeDialog({
  episodeId,
  episodeTitle,
  isOpen,
  onOpenChange,
}: ScheduleEpisodeDialogProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const handleSchedule = async () => {
    if (!date) {
      toast.error("Por favor, selecione uma data.");
      return;
    }

    // Adiciona o horário atual à data selecionada para garantir que não seja no passado
    const now = new Date();
    date.setHours(now.getHours(), now.getMinutes(), now.getSeconds());

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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Agendar Episódio</DialogTitle>
          <DialogDescription>
            Você está agendando o episódio: "{episodeTitle}".
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center py-4">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
            disabled={(currentDate) =>
              currentDate <
              new Date(new Date().setDate(new Date().getDate() - 1))
            } // Desabilita dias passados
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
