"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/src/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/src/components/ui/command";
import { Plus, Search, ChevronsUpDown, ArrowDownUp } from "lucide-react";

interface CategoryHeaderProps {
  categorySearchTerm: string;
  setCategorySearchTerm: (term: string) => void;
  categories: Array<{ id: string; name: string }>;
  open: boolean;
  setOpen: (open: boolean) => void;
  sortOrder: "asc" | "desc";
  setSortOrder: (order: "asc" | "desc") => void;
  sortType: "name" | "episodes";
  setSortType: (type: "name" | "episodes") => void;
  newCategoryName: string;
  setNewCategoryName: (name: string) => void;
  handleAddCategory: () => void;
}

export function CategoryHeader({
  categorySearchTerm,
  setCategorySearchTerm,
  categories,
  open,
  setOpen,
  sortOrder,
  setSortOrder,
  sortType,
  setSortType,
  newCategoryName,
  setNewCategoryName,
  handleAddCategory,
}: CategoryHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 mt-4">
      <div className="relative flex-1">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              {categorySearchTerm || "Buscar categorias..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput
                placeholder="Buscar categoria..."
                onValueChange={setCategorySearchTerm}
              />
              <CommandEmpty>Nenhuma categoria encontrada.</CommandEmpty>
              <CommandGroup>
                {categories.map((category) => (
                  <CommandItem
                    key={category.id}
                    onSelect={() => {
                      setCategorySearchTerm(category.name);
                      setOpen(false);
                    }}
                  >
                    {category.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant={sortType === "name" ? "secondary" : "outline"}
          onClick={() => setSortType("name")}
        >
          Nome
        </Button>
        <Button
          variant={sortType === "episodes" ? "secondary" : "outline"}
          onClick={() => setSortType("episodes")}
        >
          Episódios
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
        >
          <ArrowDownUp className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex space-x-2">
        <Input
          placeholder="Nome da nova categoria"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
        />
        <Button onClick={handleAddCategory} className="whitespace-nowrap">
          <Plus className="mr-2 h-4 w-4" /> Adicionar Categoria
        </Button>
      </div>
    </div>
  );
}
