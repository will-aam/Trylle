"use client";

import React, { useState, useMemo, useRef, useCallback } from "react";
import { X, PlusCircle } from "lucide-react";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/src/components/ui/command";
import { Badge } from "@/src/components/ui/badge";
import { Tag } from "@/src/lib/types";

interface TagSelectorProps {
  allTags: Tag[];
  value: string[]; // IDs selecionados
  onChange: (value: string[]) => void;
  onCreateTag?: (tagName: string) => Promise<Tag | null>;
  placeholder?: string;
}

export function TagSelector({
  allTags,
  value: selectedTagIds,
  onChange,
  onCreateTag,
  placeholder = "Selecione ou crie tags...",
}: TagSelectorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const selectedTags = useMemo(
    () => allTags.filter((tag) => selectedTagIds.includes(tag.id)),
    [selectedTagIds, allTags]
  );

  const filteredAvailableTags = useMemo(
    () =>
      allTags.filter(
        (tag) =>
          !selectedTagIds.includes(tag.id) &&
          tag.name.toLowerCase().includes(inputValue.toLowerCase())
      ),
    [selectedTagIds, allTags, inputValue]
  );

  const handleSelectTag = useCallback(
    (tagId: string) => {
      const next = [...selectedTagIds, tagId];
      onChange(next);
      setInputValue("");
    },
    [selectedTagIds, onChange]
  );

  const handleRemoveTag = useCallback(
    (tagId: string) => {
      const next = selectedTagIds.filter((id) => id !== tagId);
      onChange(next);
    },
    [selectedTagIds, onChange]
  );

  const handleCreateTag = async () => {
    const name = inputValue.trim();
    if (name === "" || !onCreateTag) return;

    const existingTag = allTags.find(
      (tag) => tag.name.toLowerCase() === name.toLowerCase()
    );

    if (existingTag) {
      if (!selectedTagIds.includes(existingTag.id)) {
        handleSelectTag(existingTag.id);
      }
      setInputValue("");
      return;
    }

    const newTag = await onCreateTag(name);
    if (newTag) {
      handleSelectTag(newTag.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && inputValue === "" && selectedTags.length > 0) {
      const lastTag = selectedTags[selectedTags.length - 1];
      handleRemoveTag(lastTag.id);
    }
    if (e.key === "Enter") {
      e.preventDefault();
      handleCreateTag();
    }
  };

  return (
    <Command
      className="border rounded-md"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Input fixo no topo */}
      <div className="p-2">
        <CommandInput
          ref={inputRef}
          value={inputValue}
          onValueChange={setInputValue}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            // permite mousedown selecionar antes do blur fechar a lista
            setTimeout(() => setIsFocused(false), 0);
          }}
          placeholder={placeholder}
          className="h-8"
        />
      </div>

      {/* “Nuvem” de tags selecionadas abaixo do input */}
      {selectedTags.length > 0 && (
        <div className="px-2 pb-2">
          <div className="flex flex-wrap items-center gap-2">
            {selectedTags.map((tag) => (
              <Badge
                key={tag.id}
                variant="secondary"
                className="flex items-center gap-1.5"
              >
                {tag.name}
                <button
                  type="button"
                  className="rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveTag(tag.id);
                  }}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Lista de sugestões abaixo do input (limitada a ~5 itens com rolagem) */}
      <div className="relative">
        {isFocused && (
          <CommandList className="max-h-[200px] overflow-y-auto">
            <CommandEmpty>
              {onCreateTag
                ? "Nenhuma tag encontrada. Pressione Enter para criar."
                : "Nenhuma tag encontrada."}
            </CommandEmpty>
            <CommandGroup>
              {filteredAvailableTags.map((tag) => (
                <CommandItem
                  key={tag.id}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSelectTag(tag.id);
                  }}
                  onSelect={() => handleSelectTag(tag.id)} // redundância
                  className="cursor-pointer"
                  data-tag-id={tag.id}
                >
                  {tag.name}
                </CommandItem>
              ))}
              {onCreateTag &&
                inputValue.trim() &&
                !allTags.some(
                  (t) =>
                    t.name.toLowerCase() === inputValue.trim().toLowerCase()
                ) && (
                  <CommandItem
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleCreateTag();
                    }}
                    onSelect={handleCreateTag}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Criar tag &quot;{inputValue.trim()}&quot;
                  </CommandItem>
                )}
            </CommandGroup>
          </CommandList>
        )}
      </div>
    </Command>
  );
}
