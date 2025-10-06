"use client";

import { useMemo, useState } from "react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/src/components/ui/alert-dialog";

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
  topOffsetClass?: string;
  /**
   * Status predominante atual (opcional – usado só para copy no diálogo)
   * Se você quiser calcular, passe da tabela (ex: modo derivado do 1º selecionado).
   */
  currentDominantStatus?: EpisodeStatus | null;
  /**
   * Força sempre pedir confirmação (default true)
   */
  requireConfirm?: boolean;
}

export function BulkStatusBar({
  selectedCount,
  selectedIds,
  onClear,
  onBulkUpdate,
  isPending,
  className,
  topOffsetClass = "top-[72px]",
  currentDominantStatus = null,
  requireConfirm = true,
}: BulkStatusBarProps) {
  const [targetStatus, setTargetStatus] = useState<EpisodeStatus>("draft");
  const [running, setRunning] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);

  const disabled = running || isPending || selectedCount === 0;

  const targetLabel = labelForStatus(targetStatus);
  const sourceLabel = currentDominantStatus
    ? labelForStatus(currentDominantStatus)
    : null;

  const warningText = useMemo(() => {
    if (targetStatus === "published") {
      return "Certifique-se de que todos os episódios possuem áudio e metadados corretos antes de publicar.";
    }
    if (targetStatus === "scheduled") {
      return "Status 'Agendado' requer data de publicação futura (adapte depois se quiser incluir um campo de data).";
    }
    return "Esta ação é irreversível apenas em termos de tempo histórico; você poderá alterar novamente depois.";
  }, [targetStatus]);

  const doApply = async () => {
    setRunning(true);
    try {
      const res = await onBulkUpdate(selectedIds, targetStatus);
      if (res.fail === 0) {
        toast.success(
          `Status atualizado para "${targetLabel}" em ${res.ok} episódio(s)`
        );
      } else {
        toast.error("Atualização parcial", {
          description: `${res.ok} ok / ${res.fail} falha(s)`,
        });
      }
    } catch (e: any) {
      toast.error("Erro ao aplicar em massa", {
        description: e?.message || "Tente novamente.",
      });
    } finally {
      setRunning(false);
      setOpenConfirm(false);
      onClear();
    }
  };

  const handleApplyClick = () => {
    if (requireConfirm) {
      setOpenConfirm(true);
    } else {
      void doApply();
    }
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
      {/* Info seleção */}
      <div className="text-sm">
        <span className="font-semibold">{selectedCount}</span>{" "}
        {selectedCount === 1 ? "selecionado" : "selecionados"}
        {sourceLabel && (
          <span className="ml-2 text-muted-foreground hidden sm:inline">
            (predom.: {sourceLabel})
          </span>
        )}
      </div>

      {/* Controles */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Select
            value={targetStatus}
            onValueChange={(v) => setTargetStatus(v as EpisodeStatus)}
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

          {/* Botão Aplicar com diálogo */}
          <AlertDialog open={openConfirm} onOpenChange={setOpenConfirm}>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                onClick={handleApplyClick}
                disabled={disabled}
                aria-label="Aplicar status em massa"
              >
                {running ? "Aplicando..." : "Aplicar"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Confirmar alteração em massa
                </AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="space-y-3 text-sm">
                    <p>
                      Você está prestes a alterar o status de{" "}
                      <strong>{selectedCount}</strong> episódio
                      {selectedCount > 1 && "s"} para{" "}
                      <strong>{targetLabel}</strong>.
                    </p>
                    {sourceLabel && (
                      <p className="text-muted-foreground">
                        Status predominante atual: {sourceLabel}.
                      </p>
                    )}
                    <p className="text-muted-foreground">{warningText}</p>
                    {targetStatus === "scheduled" && (
                      <p className="text-amber-500">
                        Obs: Você ainda não coleta a data aqui. Ajuste
                        futuramente para escolher published_at.
                      </p>
                    )}
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={running}>
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    if (!running) void doApply();
                  }}
                  disabled={running}
                >
                  {running ? "Processando..." : "Confirmar"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            if (running) return;
            onClear();
          }}
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
