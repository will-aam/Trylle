"use client";

import { Episode } from "@/src/lib/types";
import { Button } from "@/src/components/ui/button";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Code2,
  Download,
  Link2,
} from "lucide-react";
import { useState, useCallback, useMemo } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/src/components/ui/dropdown-menu";
import { EpisodeJsonDialog } from "./episode-json-dialog";
import { toast } from "sonner";
import { cn } from "@/src/lib/utils";

type ActionKey = "edit" | "copyAudio" | "downloadAudio" | "viewJson" | "delete";

export interface EpisodeActionsProps {
  episode: Episode;
  onEdit: (episode: Episode) => void;
  onDelete: (episode: Episode) => void;
  /** Herdado (ainda funciona) */
  size?: "default" | "icon" | "sm";
  /** Novo modo de densidade visual */
  mode?: "menu" | "primary+menu" | "inline-hover" | "auto";
  /** Ação primária quando mode=primary+menu */
  primaryAction?: "edit" | "viewJson" | "none";
  /** Deixar padding / ícones mais compactos */
  dense?: boolean;
  className?: string;
  /** Linha está selecionada? (para inline-hover mostrar mesmo sem hover) */
  active?: boolean;
}

function resolveAudioUrl(ep: Episode): string | undefined {
  const candidate =
    (ep as any).audioUrl ||
    (ep as any).audio_url ||
    (ep as any).mediaUrl ||
    (ep as any).media_url ||
    (ep as any).file_url ||
    (ep as any).fileUrl;
  return typeof candidate === "string" ? candidate : undefined;
}

export function EpisodeActions({
  episode,
  onEdit,
  onDelete,
  size, // ainda aceito, mas sobreposto por mode
  mode = "auto",
  primaryAction = "edit",
  dense = true,
  className,
  active = false,
}: EpisodeActionsProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [jsonOpen, setJsonOpen] = useState(false);
  const audioUrl = resolveAudioUrl(episode);

  const handleCopyAudio = useCallback(async () => {
    if (!audioUrl) {
      toast.error("Sem URL de áudio.");
      return;
    }
    try {
      await navigator.clipboard.writeText(audioUrl);
      toast.success("URL copiada!");
    } catch {
      toast.error("Falha ao copiar URL.");
    }
  }, [audioUrl]);

  const handleDownloadAudio = useCallback(() => {
    if (!audioUrl) {
      toast.error("Sem URL de áudio.");
      return;
    }
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = (episode.title?.replace(/\s+/g, "_") || "episodio") + ".mp3";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, [audioUrl, episode.title]);

  const openJson = () => setJsonOpen(true);

  const ACTIONS: Record<
    ActionKey,
    {
      label: string;
      icon: any;
      onClick: () => void;
      destructive?: boolean;
      disabled?: boolean;
    }
  > = {
    edit: {
      label: "Editar",
      icon: Pencil,
      onClick: () => onEdit(episode),
    },
    copyAudio: {
      label: "Copiar URL do Áudio",
      icon: Link2,
      onClick: handleCopyAudio,
      disabled: !audioUrl,
    },
    downloadAudio: {
      label: "Baixar Áudio",
      icon: Download,
      onClick: handleDownloadAudio,
      disabled: !audioUrl,
    },
    viewJson: {
      label: "Ver JSON",
      icon: Code2,
      onClick: openJson,
    },
    delete: {
      label: "Deletar",
      icon: Trash2,
      onClick: () => onDelete(episode),
      destructive: true,
    },
  };

  const primary = useMemo<ActionKey | null>(() => {
    if (mode !== "primary+menu") return null;
    if (primaryAction === "edit") return "edit";
    if (primaryAction === "viewJson") return "viewJson";
    return null;
  }, [mode, primaryAction]);

  // Se mode=auto, decide baseado em largura (CSS) — aqui simplifico:
  // (Você pode evoluir com um hook de media query)
  if (mode === "auto") {
    // Em mobile (preferir menu único) — usaremos uma classe CSS de estratégia
    // Para simplificar: sempre usa primary+menu em >= md
    // Delega para variação concreta:
    return (
      <div
        className={cn(
          "group/actions inline-flex",
          className,
          dense && "text-sm"
        )}
      >
        <div className="hidden md:inline-flex">
          <EpisodeActions
            episode={episode}
            onEdit={onEdit}
            onDelete={onDelete}
            mode="primary+menu"
            primaryAction={primaryAction}
            dense={dense}
            active={active}
          />
        </div>
        <div className="md:hidden inline-flex">
          <EpisodeActions
            episode={episode}
            onEdit={onEdit}
            onDelete={onDelete}
            mode="menu"
            dense={dense}
            active={active}
          />
        </div>
        <EpisodeJsonDialog
          episode={episode}
          open={jsonOpen}
          onOpenChange={setJsonOpen}
        />
      </div>
    );
  }

  // Modo MENU único
  if (mode === "menu") {
    return (
      <>
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                dense ? "h-8 w-8" : "h-9 w-9",
                "transition-opacity",
                className
              )}
              aria-label="Ações"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            {(
              ["edit", "copyAudio", "downloadAudio", "viewJson"] as ActionKey[]
            ).map((key) => {
              const A = ACTIONS[key];
              const Icon = A.icon;
              return (
                <DropdownMenuItem
                  key={key}
                  onClick={() => {
                    A.onClick();
                    setMenuOpen(false);
                  }}
                  disabled={A.disabled}
                >
                  <Icon className="mr-2 h-4 w-4" /> {A.label}
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                ACTIONS.delete.onClick();
                setMenuOpen(false);
              }}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Deletar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <EpisodeJsonDialog
          episode={episode}
          open={jsonOpen}
          onOpenChange={setJsonOpen}
        />
      </>
    );
  }

  // Modo PRIMARY + MENU
  if (mode === "primary+menu") {
    const primaryActionConfig = primary ? ACTIONS[primary] : undefined;

    return (
      <>
        <div className={cn("inline-flex items-center gap-1", className)}>
          {primaryActionConfig && (
            <Button
              variant="ghost"
              size="icon"
              aria-label={primaryActionConfig.label}
              onClick={primaryActionConfig.onClick}
              className={cn(
                dense ? "h-8 w-8" : "h-9 w-9",
                "border border-border"
              )}
            >
              <primaryActionConfig.icon className="h-4 w-4" />
            </Button>
          )}
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  dense ? "h-8 w-8" : "h-9 w-9",
                  "border border-border"
                )}
                aria-label="Mais ações"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-52"
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              {(Object.keys(ACTIONS) as ActionKey[])
                .filter((k) => k !== "delete" && k !== primary)
                .map((k) => {
                  const A = ACTIONS[k];
                  const Icon = A.icon;
                  return (
                    <DropdownMenuItem
                      key={k}
                      disabled={A.disabled}
                      onClick={() => {
                        A.onClick();
                        setMenuOpen(false);
                      }}
                    >
                      <Icon className="mr-2 h-4 w-4" /> {A.label}
                    </DropdownMenuItem>
                  );
                })}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  ACTIONS.delete.onClick();
                  setMenuOpen(false);
                }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Deletar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <EpisodeJsonDialog
          episode={episode}
          open={jsonOpen}
          onOpenChange={setJsonOpen}
        />
      </>
    );
  }

  // Modo INLINE-HOVER (aparece só em hover ou linha ativa)
  if (mode === "inline-hover") {
    return (
      <>
        <div
          className={cn(
            "flex items-center gap-1 opacity-0 transition-opacity",
            "group-hover/row:opacity-100",
            active && "opacity-100",
            className
          )}
        >
          {(
            [
              "edit",
              "copyAudio",
              "downloadAudio",
              "viewJson",
              "delete",
            ] as ActionKey[]
          ).map((k) => {
            const A = ACTIONS[k];
            const Icon = A.icon;
            const destructive = A.destructive;
            return (
              <Button
                key={k}
                variant="ghost"
                size="icon"
                aria-label={A.label}
                disabled={A.disabled}
                onClick={A.onClick}
                className={cn(
                  dense ? "h-7 w-7" : "h-8 w-8",
                  "border border-transparent hover:border-border",
                  destructive && "text-destructive hover:text-destructive/90"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </Button>
            );
          })}
        </div>
        <EpisodeJsonDialog
          episode={episode}
          open={jsonOpen}
          onOpenChange={setJsonOpen}
        />
      </>
    );
  }

  // fallback
  return null;
}
