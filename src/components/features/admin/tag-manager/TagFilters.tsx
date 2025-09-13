"use client";
import { Input } from "@/src/components/ui/input";
import { Search } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/src/components/ui/toggle-group";
import { FilterMode } from "./types";

interface TagFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterMode: FilterMode;
  onFilterChange: (value: FilterMode) => void;
  totalTagCount: number;
  unusedTagCount: number;
}

export function TagFilters({
  searchTerm,
  onSearchChange,
  filterMode,
  onFilterChange,
  totalTagCount,
  unusedTagCount,
}: TagFiltersProps) {
  return (
    <div className="flex flex-col gap-4 mt-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar tags..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>
        <ToggleGroup
          type="single"
          value={filterMode}
          onValueChange={(value: FilterMode) => onFilterChange(value)}
          className="justify-start"
        >
          <ToggleGroupItem value="all">Todas</ToggleGroupItem>
          <ToggleGroupItem value="used">Utilizadas</ToggleGroupItem>
          <ToggleGroupItem value="unused">Não Utilizadas</ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div className="text-sm text-muted-foreground">
        Atualmente, existem <strong>{totalTagCount}</strong> tags cadastradas.{" "}
        <span className="text-red-500">{unusedTagCount}</span> não estão em uso.
      </div>
    </div>
  );
}
