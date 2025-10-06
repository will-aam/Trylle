"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/src/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { useToast } from "@/src/hooks/use-toast";
import { X, ChevronsUpDown } from "lucide-react";
import { createSupabaseBrowserClient } from "@/src/lib/supabase-client";
import { Tag } from "@/src/lib/types";

/**
 * NOVA API
 * - allTags: universo total carregado (objetos Tag)
 * - value: IDs selecionados
 * - onChange: retorna nova lista de IDs
 * - onCreateTag: chamado quando uma tag nova é criada com sucesso (para o pai atualizar allTags)
 *
 * Observação: Ao criar uma tag, este componente NÂO muta allTags internamente,
 * delegando essa responsabilidade ao chamador via onCreateTag.
 */
interface TagSelectorProps {
  allTags: Tag[];
  value: string[]; // IDs selecionados
  onChange: (ids: string[]) => void;
  onCreateTag?: (tag: Tag) => void;
  disabled?: boolean;
  maxVisibleBadges?: number; // opcional: compactar visual
  className?: string;
  placeholder?: string;
  allowCreate?: boolean; // default true
}

export function TagSelector({
  allTags,
  value,
  onChange,
  onCreateTag,
  disabled = false,
  maxVisibleBadges,
  className,
  placeholder = "Selecione ou crie tags...",
  allowCreate = true,
}: TagSelectorProps) {
  const supabase = createSupabaseBrowserClient();
  const { toast } = useToast();

  const [inputValue, setInputValue] = useState("");
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  /* Resolve objetos selecionados a partir dos IDs */
  const selectedTagObjects = useMemo(
    () => allTags.filter((t) => value.includes(t.id)),
    [allTags, value]
  );

  /* Tags disponíves para seleção filtradas por input */
  const filteredAvailable = useMemo(() => {
    const lower = inputValue.toLowerCase();
    return allTags
      .filter((t) => !value.includes(t.id))
      .filter((t) => (lower ? t.name.toLowerCase().includes(lower) : true));
  }, [allTags, value, inputValue]);

  /* Verifica se deve exibir opção de criar */
  const canCreate =
    allowCreate &&
    inputValue.trim().length > 0 &&
    !allTags.some(
      (t) => t.name.toLowerCase() === inputValue.trim().toLowerCase()
    );

  const closePopover = useCallback(() => {
    setPopoverOpen(false);
    setInputValue("");
  }, []);

  const handleSelectTag = (tag: Tag) => {
    if (disabled) return;
    if (!value.includes(tag.id)) {
      onChange([...value, tag.id]);
    }
    closePopover();
  };

  const handleRemoveTag = (tagId: string) => {
    if (disabled) return;
    onChange(value.filter((id) => id !== tagId));
  };

  const handleCreateTag = async () => {
    if (!canCreate || disabled) return;
    const name = inputValue.trim();
    setCreating(true);
    try {
      const { data, error } = await supabase
        .from("tags")
        .insert([{ name }])
        .select()
        .single();

      if (error || !data) {
        toast({
          title: "Erro",
          description: error?.message || "Não foi possível criar a tag.",
          variant: "destructive",
        });
        return;
      }

      const newTag: Tag = data;
      onCreateTag?.(newTag);
      onChange([...value, newTag.id]);

      toast({
        title: "Tag criada",
        description: `A tag "${newTag.name}" foi adicionada.`,
      });
      closePopover();
    } finally {
      setCreating(false);
    }
  };

  /* Renderização compactada das badges (opcional) */
  const badgesToRender = useMemo(() => {
    if (!maxVisibleBadges || selectedTagObjects.length <= maxVisibleBadges) {
      return { visible: selectedTagObjects, overflow: 0 };
    }
    const visible = selectedTagObjects.slice(0, maxVisibleBadges);
    const overflow = selectedTagObjects.length - maxVisibleBadges;
    return { visible, overflow };
  }, [selectedTagObjects, maxVisibleBadges]);

  return (
    <div className={className}>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={popoverOpen}
            disabled={disabled}
            className="w-full justify-between font-normal"
          >
            <span className="truncate text-left">
              {selectedTagObjects.length > 0
                ? selectedTagObjects.map((t) => t.name).join(", ")
                : placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[--radix-popover-trigger-width] p-0"
          align="start"
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Buscar ou criar..."
              value={inputValue}
              onValueChange={setInputValue}
              disabled={disabled || creating}
            />
            <CommandList>
              {filteredAvailable.length === 0 && !canCreate && (
                <CommandEmpty>Nenhuma tag encontrada.</CommandEmpty>
              )}
              <CommandGroup heading="Tags">
                {filteredAvailable.map((tag) => (
                  <CommandItem
                    key={tag.id}
                    onSelect={() => handleSelectTag(tag)}
                  >
                    {tag.name}
                  </CommandItem>
                ))}
                {canCreate && (
                  <CommandItem
                    disabled={creating}
                    onSelect={() => {
                      void handleCreateTag();
                    }}
                  >
                    {creating
                      ? "Criando..."
                      : `Criar nova tag: "${inputValue.trim()}"`}
                  </CommandItem>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <div className="flex flex-wrap gap-2 mt-2">
        {badgesToRender.visible.map((tag) => (
          <Badge key={tag.id} variant="secondary" className="flex items-center">
            {tag.name}
            {!disabled && (
              <button
                type="button"
                aria-label={`Remover tag ${tag.name}`}
                onClick={() => handleRemoveTag(tag.id)}
                className="ml-2 rounded-full outline-none hover:bg-destructive/80 p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </Badge>
        ))}
        {badgesToRender.overflow > 0 && (
          <Badge variant="outline">+{badgesToRender.overflow} outras</Badge>
        )}
      </div>
    </div>
  );
}
