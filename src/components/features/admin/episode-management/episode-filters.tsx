"use client";

import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/src/components/ui/popover";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/src/components/ui/select";
import { Filter, X } from "lucide-react";
import { Category } from "@/src/lib/types";
import { useState } from "react";

interface EpisodeFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string[];
  setStatusFilter: (statuses: string[]) => void;
  categoryFilter: string[];
  setCategoryFilter: (categories: string[]) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  categories: Category[];
}

const statusOptions = [
  { value: "published", label: "Publicado" },
  { value: "draft", label: "Rascunho" },
  { value: "scheduled", label: "Agendado" },
];

export function EpisodeFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  onClearFilters,
  hasActiveFilters,
  categories,
}: EpisodeFiltersProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex-1 w-full md:w-auto">
        <div className="relative flex items-center w-full max-w-lg border border-input rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 group">
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className="pl-3 pr-2 rounded-r-none border-r border-input group-focus-within:border-ring"
              >
                <Filter className="h-4 w-4 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              side="bottom"
              align="start"
              className="w-64 p-4 mt-2"
              style={{
                minWidth: "16rem",
                maxWidth: "20rem",
                marginTop: "0.5rem",
                zIndex: 50,
              }}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Filtrar por Status
                </label>
                <Select
                  value={statusFilter[0] || ""}
                  onValueChange={(value) => setStatusFilter([value])}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Escolha o status..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-40 overflow-y-auto">
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Filtrar por Categoria
                </label>
                <Select
                  value={categoryFilter[0] || ""}
                  onValueChange={(value) => setCategoryFilter([value])}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Escolha a categoria..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-40 overflow-y-auto">
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </PopoverContent>
          </Popover>
          <div className="relative flex-1">
            <Input
              placeholder="Filtrar por título ou tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 border-0 rounded-l-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <Button
          variant="outline"
          onClick={onClearFilters}
          className="shrink-0 bg-transparent"
        >
          <X className="mr-2 h-4 w-4" />
          Limpar Filtros
        </Button>
      )}
    </div>
  );
}
