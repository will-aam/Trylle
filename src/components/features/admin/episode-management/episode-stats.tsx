"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { ListMusic, CheckCircle, Clock, Archive, Info } from "lucide-react";
import { cn } from "@/src/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";

interface EpisodeStatsProps {
  /** Count resultante da busca/filtros atuais */
  totalCount: number;
  /** Counts globais (não filtrados) */
  publishedCount: number;
  draftCount: number;
  scheduledCount: number;
  /** Caso queira mostrar o total global de todos (somatório) para comparação */
  globalTotal?: number;
  /** Exibir porcentagens em relação ao globalTotal */
  showPercentages?: boolean;
  /** Exibir skeleton */
  isLoading?: boolean;
  /** Classe externa opcional */
  className?: string;
  /** Modo compacto (menor padding) */
  compact?: boolean;
}

interface StatConfig {
  key: string;
  label: string;
  value: number;
  icon: React.ComponentType<any>;
  tooltip?: string;
  variant?: "default" | "accent";
}

function formatPercent(part: number, total?: number) {
  if (!total || total === 0) return "";
  const pct = (part / total) * 100;
  return `${pct.toFixed(pct >= 10 ? 0 : 1)}%`;
}

export function EpisodeStats({
  totalCount,
  publishedCount,
  draftCount,
  scheduledCount,
  globalTotal,
  showPercentages = false,
  isLoading = false,
  className,
  compact = false,
}: EpisodeStatsProps) {
  const effectiveGlobalTotal =
    typeof globalTotal === "number"
      ? globalTotal
      : publishedCount + draftCount + scheduledCount;

  const stats: StatConfig[] = [
    {
      key: "total",
      label: "Total (filtrado)",
      value: totalCount,
      icon: ListMusic,
      tooltip:
        "Quantidade de episódios após aplicar filtros (título, status, categoria, etc.).",
      variant: "accent",
    },
    {
      key: "published",
      label: "Publicados",
      value: publishedCount,
      icon: CheckCircle,
      tooltip: "Todos os episódios com status Publicado (global).",
    },
    {
      key: "draft",
      label: "Rascunhos",
      value: draftCount,
      icon: Archive,
      tooltip: "Todos os episódios ainda em rascunho (global).",
    },
    {
      key: "scheduled",
      label: "Agendados",
      value: scheduledCount,
      icon: Clock,
      tooltip: "Episódios com publicação futura agendada (global).",
    },
  ];

  return (
    <div
      className={cn(
        "grid w-full gap-3 sm:gap-4",
        // Layout fluido: mínimo 140px por card
        "grid-cols-[repeat(auto-fit,minmax(140px,1fr))]",
        className
      )}
    >
      {stats.map((stat) => {
        const Icon = stat.icon;
        const percent =
          showPercentages && stat.key !== "total"
            ? formatPercent(stat.value, effectiveGlobalTotal)
            : "";

        return (
          <Card
            key={stat.key}
            className={cn(
              "relative overflow-hidden",
              compact ? "py-1" : "",
              stat.variant === "accent"
                ? "border-primary/40 shadow-sm"
                : "border-border/60"
            )}
          >
            <CardHeader
              className={cn(
                "flex flex-row items-start justify-between space-y-0 pb-2",
                compact ? "px-3 py-2" : "px-4 pt-4"
              )}
            >
              <CardTitle
                className={cn(
                  "text-xs font-medium tracking-wide text-muted-foreground",
                  compact && "text-[11px]"
                )}
              >
                <span className="inline-flex items-center gap-1">
                  {stat.label}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 opacity-50 hover:opacity-80 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <p className="text-xs leading-relaxed">
                          {stat.tooltip}
                        </p>
                        {stat.key !== "total" && effectiveGlobalTotal > 0 && (
                          <p className="mt-2 text-[10px] text-muted-foreground">
                            Parte de {effectiveGlobalTotal} episódios globais.
                          </p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </span>
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent
              className={cn(
                "flex flex-col",
                compact ? "px-3 pb-3 pt-0" : "px-4 pb-4 pt-0"
              )}
            >
              {isLoading ? (
                <div className="h-6 w-12 animate-pulse rounded bg-muted/40" />
              ) : (
                <div
                  className={cn(
                    "font-bold",
                    compact ? "text-lg leading-none" : "text-2xl"
                  )}
                >
                  {stat.value}
                </div>
              )}
              {stat.key === "total" && effectiveGlobalTotal > 0 && (
                <p className="mt-1 text-[11px] text-muted-foreground">
                  de {effectiveGlobalTotal} globais
                </p>
              )}
              {percent && (
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {percent} do total
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
