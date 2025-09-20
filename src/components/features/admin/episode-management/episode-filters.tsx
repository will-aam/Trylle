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
import { Category } from "@/src/lib/types";

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
    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex-1 w-full md:w-auto">
        <div className="relative flex items-center w-full max-w-lg border border-input rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 group">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="pl-3 pr-2 rounded-r-none border-r border-input group-focus-within:border-ring"
              >
                <Filter className="h-4 w-4 text-muted-foreground" />
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
              {categories.map((category) => (
                <DropdownMenuCheckboxItem
                  key={category.id}
                  checked={categoryFilter.includes(category.id)}
                  onSelect={(e) => {
                    e.preventDefault();
                    handleCategoryChange(category.id);
                  }}
                >
                  {category.name}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
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
