"use client";

import React, { useState } from "react";
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

type Status = Episode["status"];

interface StatusBadgeSelectorProps {
  status: Status;
  onStatusChange: (newStatus: Status) => void;
  onSchedule: () => void;
  disabled?: boolean;
}

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
  const [open, setOpen] = useState(false);

  const current = statusConfig[status];
  const options = Object.keys(statusConfig) as Status[];

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
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
          const isSchedule = opt === "scheduled";
          return (
            <DropdownMenuItem
              key={opt}
              onSelect={(e) => {
                e.preventDefault();
                setOpen(false);
                if (isSchedule) {
                  setTimeout(() => onSchedule(), 0);
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
