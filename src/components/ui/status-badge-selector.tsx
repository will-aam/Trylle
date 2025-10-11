// src/components/ui/status-badge-selector.tsx

"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Badge } from "@/src/components/ui/badge";
import { Episode } from "@/src/lib/types";
import { cn } from "@/src/lib/utils";
import {
  CheckCircle2,
  FileText,
  CalendarClock,
  ChevronDown,
} from "lucide-react";

// Usando o tipo diretamente da fonte da verdade
type Status = Episode["status"];

interface StatusBadgeSelectorProps {
  status: Status;
  onStatusChange: (newStatus: Status) => void;
  onSchedule: () => void;
  disabled?: boolean;
}

// Objeto de configuração apenas com os 3 status necessários
const statusConfig: Record<
  Status,
  {
    label: string;
    variant: "default" | "secondary" | "outline";
    icon: React.ElementType;
    textColor?: string;
  }
> = {
  published: {
    label: "Publicado",
    variant: "default",
    icon: CheckCircle2,
  },
  draft: { label: "Rascunho", variant: "secondary", icon: FileText },
  scheduled: {
    label: "Agendado",
    variant: "outline",
    icon: CalendarClock,
    textColor: "text-primary",
  },
};

export function StatusBadgeSelector({
  status,
  onStatusChange,
  onSchedule,
  disabled = false,
}: StatusBadgeSelectorProps) {
  const current = statusConfig[status];
  const options = Object.keys(statusConfig) as Status[];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <Badge
          variant={current.variant}
          className={cn(
            "capitalize cursor-pointer transition-all hover:ring-2 hover:ring-ring hover:ring-offset-2 hover:ring-offset-background",
            disabled && "cursor-not-allowed opacity-70"
          )}
        >
          <current.icon
            className={cn("mr-1.5 h-3.5 w-3.5", current.textColor)}
          />
          <span className={cn(current.textColor)}>{current.label}</span>
          {!disabled && <ChevronDown className="ml-1.5 h-3 w-3" />}
        </Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {options.map((opt) => {
          const config = statusConfig[opt];
          return (
            <DropdownMenuItem
              key={opt}
              onClick={() => {
                if (opt === "scheduled") {
                  onSchedule();
                } else {
                  onStatusChange(opt);
                }
              }}
            >
              <config.icon className={cn("mr-2 h-4 w-4", config.textColor)} />
              <span className={cn(config.textColor)}>{config.label}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
