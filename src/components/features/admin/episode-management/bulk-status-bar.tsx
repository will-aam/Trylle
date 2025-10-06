"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/src/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/src/lib/utils";

type EpisodeStatus = "draft" | "published" | "scheduled";

interface BulkStatusBarProps {
  selectedCount: number;
  selectedIds: string[];
  onClear: () => void;
  onBulkUpdate: (
    ids: string[],
    newStatus: EpisodeStatus
  ) => Promise<{ ok: number; fail: number }>;
  isPending?: boolean;
  className?: string;
  /**
   * Se quiser ajustar o deslocamento do topo (depende da altura do header fixo)
   */
  topOffsetClass?: string; // ex: "top-[72px]"
}

export function BulkStatusBar({
  selectedCount,
  selectedIds,
  onClear,
  onBulkUpdate,
  isPending,
  className,
  topOffsetClass = "top-[72px]",
}: BulkStatusBarProps) {
  const [status, setStatus] = useState<EpisodeStatus>("draft");
  const [running, setRunning] = useState(false);

  const disabled = running || isPending || selectedCount === 0;

  const apply = async () => {
    if (!status) return;
    setRunning(true);
    const res = await onBulkUpdate(selectedIds, status);
    setRunning(false);

    if (res.fail === 0) {
      toast.success(
        `Status atualizado para "${labelForStatus(status)}" em ${
          res.ok
        } episódio(s).`
      );
    } else {
      toast.error("Alguns episódios falharam", {
        description: `${res.ok} ok / ${res.fail} falha(s)`,
      });
    }
    onClear();
  };

  return (
    <div
      className={cn(
        "sticky z-40 mb-4 flex flex-col gap-3 rounded-md border",
        "bg-background/95 p-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/75",
        "sm:flex-row sm:items-center sm:justify-between",
        topOffsetClass,
        className
      )}
      aria-label="Ações em massa"
    >
      <div className="text-sm">
        <span className="font-semibold">{selectedCount}</span>{" "}
        {selectedCount === 1 ? "selecionado" : "selecionados"}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Select
            value={status}
            onValueChange={(v) => setStatus(v as EpisodeStatus)}
            disabled={disabled}
          >
            <SelectTrigger
              className="h-8 w-[170px]"
              aria-label="Selecionar novo status"
            >
              <SelectValue placeholder="Novo status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Rascunho</SelectItem>
              <SelectItem value="published">Publicado</SelectItem>
              <SelectItem value="scheduled">Agendado</SelectItem>
            </SelectContent>
          </Select>
          <Button
            size="sm"
            onClick={apply}
            disabled={disabled}
            aria-label="Aplicar status em massa"
          >
            Aplicar
          </Button>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={onClear}
          disabled={running}
          aria-label="Limpar seleção"
        >
          Limpar seleção
        </Button>
      </div>
    </div>
  );
}

function labelForStatus(status: EpisodeStatus) {
  switch (status) {
    case "draft":
      return "Rascunho";
    case "published":
      return "Publicado";
    case "scheduled":
      return "Agendado";
  }
}
