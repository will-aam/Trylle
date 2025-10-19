// src/components/features/admin/episode-management/edit/fields/tags-field.tsx
"use client";

import React, { useState, useMemo, useCallback } from "react";
import { ControllerRenderProps } from "react-hook-form";
import { X, PlusCircle } from "lucide-react";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/src/components/ui/command";
import { FormItem, FormLabel } from "@/src/components/ui/form";
import { Badge } from "@/src/components/ui/badge";
import { Tag } from "@/src/lib/types";

// A interface foi atualizada para refletir o novo contrato da função onCreateTag
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
  placeholder = "Pesquisar ou criar tags...",
}: TagsFieldProps) {
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // O valor do campo (field.value) é um array de IDs: ['id1', 'id2']
  const selectedTagIds = field.value || [];

  // Pega os objetos Tag completos com base nos IDs selecionados
  const selectedTags = useMemo(
    () => allTags.filter((tag) => selectedTagIds.includes(tag.id)),
    [selectedTagIds, allTags]
  );

  // Filtra a lista de tags para a busca, excluindo as já selecionadas
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
      field.onChange([...selectedTagIds, tagId]); // Adiciona o ID ao formulário
      setInputValue(""); // Limpa a busca
    },
    [selectedTagIds, field]
  );

  const handleRemoveTag = useCallback(
    (tagId: string) => {
      field.onChange(selectedTagIds.filter((id: string) => id !== tagId)); // Remove o ID do formulário
    },
    [selectedTagIds, field]
  );

  const handleCreateTag = async () => {
    if (inputValue.trim() === "") return;

    const existingTag = allTags.find(
      (t) => t.name.toLowerCase() === inputValue.trim().toLowerCase()
    );
    if (existingTag) {
      if (!selectedTagIds.includes(existingTag.id)) {
        handleSelectTag(existingTag.id);
      }
      setInputValue("");
      return;
    }

    const newTag = await onCreateTag(inputValue.trim());
    if (newTag) {
      handleSelectTag(newTag.id); // Seleciona a tag recém-criada
    }
  };

  return (
    <FormItem>
      <div className="flex items-center gap-4">
        <FormLabel className="mt-2">Tags</FormLabel>
        <Command className="flex-1 border rounded-md relative">
          {/* A barra de pesquisa agora fica aqui */}
          <CommandInput
            value={inputValue}
            onValueChange={setInputValue}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={(e) =>
              e.key === "Enter" && (e.preventDefault(), handleCreateTag())
            }
            placeholder={placeholder}
            className="h-9"
          />
          {/* A lista de resultados aparece abaixo da barra */}
          {isFocused && (
            <CommandList className="absolute z-10 w-full mt-10 bg-background border rounded-md shadow-md">
              <CommandEmpty
                onSelect={handleCreateTag}
                className="cursor-pointer p-2"
              >
                <div className="flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Criar tag &quot;{inputValue.trim()}&quot;
                </div>
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
              </CommandGroup>
            </CommandList>
          )}
        </Command>
      </div>

      {/* As tags selecionadas aparecem aqui embaixo */}
      <div className="flex flex-wrap gap-2 pt-2 min-h-[2.5rem]">
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
              onClick={() => handleRemoveTag(tag.id)}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
    </FormItem>
  );
}
