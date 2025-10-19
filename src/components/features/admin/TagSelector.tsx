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
import { cn } from "@/src/lib/utils";

interface TagSelectorProps {
  allTags: Tag[];
  value: string[]; // Recebe um array de IDs das tags selecionadas
  onChange: (value: string[]) => void; // Notifica o formulário sobre a mudança
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

  // Deriva as tags selecionadas a partir dos IDs recebidos. Esta é a fonte da verdade.
  const selectedTags = useMemo(
    () => allTags.filter((tag) => selectedTagIds.includes(tag.id)),
    [selectedTagIds, allTags]
  );

  // Filtra a lista de tags disponíveis para não mostrar as que já foram selecionadas.
  // Também filtra com base no que o usuário está digitando.
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
      onChange([...selectedTagIds, tagId]);
      setInputValue(""); // Limpa o input após a seleção
    },
    [selectedTagIds, onChange]
  );

  const handleRemoveTag = useCallback(
    (tagId: string) => {
      onChange(selectedTagIds.filter((id) => id !== tagId));
    },
    [selectedTagIds, onChange]
  );

  const handleCreateTag = async () => {
    if (inputValue.trim() === "" || !onCreateTag) return;

    // Evita criar tag duplicada se já existir (mesmo com case diferente)
    const existingTag = allTags.find(
      (tag) => tag.name.toLowerCase() === inputValue.trim().toLowerCase()
    );

    if (existingTag) {
      // Se a tag já existe e não está selecionada, apenas a seleciona
      if (!selectedTagIds.includes(existingTag.id)) {
        handleSelectTag(existingTag.id);
      }
      setInputValue("");
      return;
    }

    const newTag = await onCreateTag(inputValue.trim());
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
    // O componente Command do ShadCN já gerencia a abertura e o foco, corrigindo o layout.
    <Command
      className="border rounded-md"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex flex-wrap items-center gap-2 p-2">
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
                e.stopPropagation(); // Evita que o clique feche o seletor
                handleRemoveTag(tag.id);
              }}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <CommandInput
          ref={inputRef}
          value={inputValue}
          onValueChange={setInputValue}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={selectedTags.length > 0 ? "" : placeholder}
          className="flex-1 h-auto p-0 bg-transparent border-0 shadow-none outline-none focus:ring-0"
        />
      </div>
      <div className="relative mt-2">
        {isFocused && (
          <CommandList>
            <CommandEmpty>
              {onCreateTag
                ? "Nenhuma tag encontrada. Pressione Enter para criar."
                : "Nenhuma tag encontrada."}
            </CommandEmpty>
            <CommandGroup>
              {filteredAvailableTags.map((tag) => (
                <CommandItem
                  key={tag.id}
                  onSelect={() => handleSelectTag(tag.id)}
                  className="cursor-pointer"
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
