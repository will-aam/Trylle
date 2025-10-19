// src/components/features/admin/episode-management/edit/fields/tags-field.tsx
"use client";

import React, { useState, useMemo } from "react";
import { ControllerRenderProps } from "react-hook-form";
import { X, PlusCircle, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/src/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import { FormItem, FormLabel } from "@/src/components/ui/form";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Tag } from "@/src/lib/types";

interface TagsFieldProps {
  field: ControllerRenderProps<any, "tags">;
  allTags: Tag[];
  onCreateTag: (tagName: string) => Promise<Tag | null>;
  placeholder?: string;
}

export function TagsField({
  field,
  allTags,
  onCreateTag,
  placeholder = "Selecione as tags...",
}: TagsFieldProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const selectedTagIds = new Set(field.value || []);

  const selectedTags = useMemo(
    () => allTags.filter((tag) => selectedTagIds.has(tag.id)),
    [allTags, selectedTagIds]
  );

  const filteredAvailableTags = useMemo(
    () =>
      allTags.filter(
        (tag) =>
          !selectedTagIds.has(tag.id) &&
          tag.name.toLowerCase().includes(inputValue.toLowerCase())
      ),
    [allTags, selectedTagIds, inputValue]
  );

  const handleSelect = (tagId: string) => {
    const newSelectedIds = new Set(selectedTagIds);
    newSelectedIds.add(tagId);
    field.onChange(Array.from(newSelectedIds));
    setInputValue("");
  };

  const handleCreate = async () => {
    const trimmedInput = inputValue.trim();
    if (trimmedInput === "") return;

    const existingTag = allTags.find(
      (t) => t.name.toLowerCase() === trimmedInput.toLowerCase()
    );

    if (existingTag) {
      handleSelect(existingTag.id);
      return;
    }

    const newTag = await onCreateTag(trimmedInput);
    if (newTag) {
      handleSelect(newTag.id);
    }
  };

  const handleUnselect = (tagId: string) => {
    const newSelectedIds = new Set(selectedTagIds);
    newSelectedIds.delete(tagId);
    field.onChange(Array.from(newSelectedIds));
  };

  return (
    <FormItem>
      <FormLabel>Tags</FormLabel>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto min-h-11"
          >
            <div className="flex flex-wrap gap-1 items-center">
              {selectedTags.length > 0 ? (
                selectedTags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="secondary"
                    className="flex items-center gap-1.5"
                  >
                    {tag.name}
                    <button
                      type="button"
                      aria-label={`Remover ${tag.name}`}
                      onClick={(e) => {
                        e.stopPropagation(); // Impede o popover de fechar
                        handleUnselect(tag.id);
                      }}
                      className="rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))
              ) : (
                <span className="text-muted-foreground font-normal">
                  {placeholder}
                </span>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput
              placeholder="Pesquisar ou criar..."
              value={inputValue}
              onValueChange={setInputValue}
            />
            <CommandList className="max-h-[200px] overflow-y-auto">
              <CommandEmpty>
                <CommandItem
                  // A CORREÇÃO PRINCIPAL ESTÁ AQUI:
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onSelect={handleCreate}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <PlusCircle className="h-4 w-4" />
                    Criar tag &quot;{inputValue.trim()}&quot;
                  </div>
                </CommandItem>
              </CommandEmpty>
              <CommandGroup>
                {filteredAvailableTags.map((tag) => (
                  <CommandItem
                    key={tag.id}
                    // E A CORREÇÃO ESTÁ AQUI TAMBÉM:
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onSelect={() => handleSelect(tag.id)}
                    className="cursor-pointer"
                  >
                    {tag.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </FormItem>
  );
}
