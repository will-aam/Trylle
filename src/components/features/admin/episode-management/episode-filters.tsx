"use client";

import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Search, X, Filter } from "lucide-react";

interface EpisodeFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string[];
  setStatusFilter: (statuses: string[]) => void;
  categoryFilter: string[];
  setCategoryFilter: (categories: string[]) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

const statusOptions = [
  { value: "published", label: "Publicado" },
  { value: "draft", label: "Rascunho" },
  { value: "scheduled", label: "Agendado" },
  { value: "archived", label: "Arquivado" },
];

const categoryOptions = [
  { value: "Tecnologia", label: "Tecnologia" },
  { value: "Design", label: "Design" },
  { value: "Marketing", label: "Marketing" },
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
}: EpisodeFiltersProps) {
  const handleStatusChange = (value: string) => {
    const newStatusFilter = statusFilter.includes(value)
      ? statusFilter.filter((s) => s !== value)
      : [...statusFilter, value];
    setStatusFilter(newStatusFilter);
  };

  const handleCategoryChange = (value: string) => {
    const newCategoryFilter = categoryFilter.includes(value)
      ? categoryFilter.filter((c) => c !== value)
      : [...categoryFilter, value];
    setCategoryFilter(newCategoryFilter);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por título ou tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
              onClick={() => setSearchTerm("")}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="shrink-0 bg-transparent">
                <Filter className="mr-2 h-4 w-4" />
                Filtros
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Filtrar por Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {statusOptions.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.value}
                  checked={statusFilter.includes(option.value)}
                  onSelect={(e) => {
                    e.preventDefault();
                    handleStatusChange(option.value);
                  }}
                >
                  {option.label}
                </DropdownMenuCheckboxItem>
              ))}

              <DropdownMenuSeparator />
              <DropdownMenuLabel>Filtrar por Categoria</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {categoryOptions.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.value}
                  checked={categoryFilter.includes(option.value)}
                  onSelect={(e) => {
                    e.preventDefault();
                    handleCategoryChange(option.value);
                  }}
                >
                  {option.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

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
      </div>
    </div>
  );
}
