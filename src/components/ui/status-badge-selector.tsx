"use client";

import { useState } from "react";
import { Badge } from "@/src/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/src/components/ui/select";

type EpisodeStatus = "published" | "draft" | "scheduled";

interface StatusBadgeSelectorProps {
  status: EpisodeStatus;
  onStatusChange: (newStatus: EpisodeStatus) => void;
  disabled?: boolean;
}

const statusConfig = {
  published: {
    label: "Publicado",
    className: "bg-green-600 hover:bg-green-700 text-white",
  },
  draft: {
    label: "Rascunho",
    className: "bg-blue-500 hover:bg-blue-600 text-gray-800",
  },
  scheduled: {
    label: "Agendado",
    className: "bg-yellow-500 hover:bg-yellow-600 text-black",
  },
};

export function StatusBadgeSelector({
  status,
  onStatusChange,
  disabled = false,
}: StatusBadgeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentConfig = statusConfig[status];

  if (disabled) {
    return (
      <Badge className={currentConfig.className}>{currentConfig.label}</Badge>
    );
  }

  return (
    <Select
      value={status}
      onValueChange={(value: EpisodeStatus) => {
        onStatusChange(value);
        setIsOpen(false);
      }}
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <SelectTrigger className="w-auto h-auto p-0 border-none bg-transparent [&>svg]:hidden [&_span]:p-1.5 [&_span]:px-2.5 [&_span]:rounded-md [&_span]:text-xs [&_span]:font-medium [&_span]:transition-colors [&_span]:cursor-pointer">
        <span className={currentConfig.className}>{currentConfig.label}</span>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="published">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-600"></div>
            Publicado
          </div>
        </SelectItem>
        <SelectItem value="draft">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
            Rascunho
          </div>
        </SelectItem>
        <SelectItem value="scheduled">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            Agendado
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
