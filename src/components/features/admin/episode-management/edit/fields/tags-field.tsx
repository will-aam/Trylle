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
    const next = Array.from(newSelectedIds);
    console.log("[TagsField] handleSelect →", { tagId, next });
    field.onChange(next);
    setInputValue("");
    setOpen(false); // fecha após selecionar
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
    const next = Array.from(newSelectedIds);
    console.log("[TagsField] handleUnselect →", { tagId, next });
    field.onChange(next);
  };

  return (
    <FormItem>
      <FormLabel>Tags</FormLabel>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          {/* trigger com div para evitar nesting de <button> */}
          <div
            role="combobox"
            aria-expanded={open}
            tabIndex={0}
            className="w-full h-auto min-h-11 inline-flex items-center justify-between gap-2 whitespace-nowrap rounded-md border bg-background px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex flex-wrap gap-1 items-center">
              {selectedTags.length > 0 ? (
                selectedTags.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs bg-secondary text-secondary-foreground"
                  >
                    {tag.name}
                    <span
                      role="button"
                      tabIndex={0}
                      aria-label={`Remover ${tag.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnselect(tag.id);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          e.stopPropagation();
                          handleUnselect(tag.id);
                        }
                      }}
                      className="rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </span>
                  </span>
                ))
              ) : (
                <span className="text-muted-foreground font-normal">
                  {placeholder}
                </span>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </div>
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
                <CommandItem onSelect={handleCreate} className="cursor-pointer">
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
