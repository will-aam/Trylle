// src/components/features/admin/episode-management/ScheduleEpisodeDialog.tsx

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

// Interface de Props corrigida para aceitar o título
export interface ScheduleEpisodeDialogProps {
  episodeId: string;
  episodeTitle: string; // Prop adicionada
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: (date: Date) => void;
}

export function ScheduleEpisodeDialog({
  episodeId,
  episodeTitle, // Prop recebida
  isOpen,
  onOpenChange,
  onConfirm,
}: ScheduleEpisodeDialogProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const handleConfirm = () => {
    if (date) {
      onConfirm(date);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Agendar Episódio</DialogTitle>
          {/* Usando a prop para dar mais contexto ao usuário */}
          <DialogDescription>
            Você está definindo a data de publicação para: "{episodeTitle}".
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
            }
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!date}>
            Confirmar Agendamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
