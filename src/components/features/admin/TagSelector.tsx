"use client";

import { useState, useEffect, useMemo } from "react";
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
import { createClient } from "@/src/lib/supabase-client";
import { Tag } from "@/src/lib/types";

interface TagSelectorProps {
  selectedTags: Tag[];
  onSelectedTagsChange: (tags: Tag[]) => void;
}

export function TagSelector({
  selectedTags,
  onSelectedTagsChange,
}: TagSelectorProps) {
  const supabase = createClient();
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [tagInputValue, setTagInputValue] = useState("");
  const [popoverOpen, setPopoverOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadTags = async () => {
      const { data } = await supabase.from("tags").select("*").order("name");
      setAllTags(data || []);
    };
    loadTags();
  }, [supabase]);

  const handleTagSelect = (tag: Tag) => {
    if (!selectedTags.some((t) => t.id === tag.id)) {
      onSelectedTagsChange([...selectedTags, tag]);
    }
    setTagInputValue("");
    setPopoverOpen(false);
  };

  const handleTagRemove = (tagId: string) => {
    onSelectedTagsChange(selectedTags.filter((t) => t.id !== tagId));
  };

  const handleCreateTag = async (tagName: string) => {
    const trimmedName = tagName.trim();
    if (!trimmedName) return;

    const existingTag = allTags.find(
      (t) => t.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (existingTag) {
      toast({
        title: "Tag já existente",
        description: `A tag "${existingTag.name}" foi adicionada à sua seleção.`,
      });
      handleTagSelect(existingTag);
      return;
    }

    const { data, error } = await supabase
      .from("tags")
      .insert([{ name: trimmedName }])
      .select()
      .single();

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar a tag.",
        variant: "destructive",
      });
    } else {
      setAllTags((prev) =>
        [...prev, data].sort((a, b) => a.name.localeCompare(b.name))
      );
      handleTagSelect(data);
      toast({
        title: "Tag criada",
        description: `A tag "${data.name}" foi criada e selecionada.`,
      });
    }
    setTagInputValue("");
    setPopoverOpen(false);
  };

  const filteredTags = useMemo(() => {
    if (!tagInputValue) return allTags;
    return allTags.filter((tag) =>
      tag.name.toLowerCase().includes(tagInputValue.toLowerCase())
    );
  }, [tagInputValue, allTags]);

  const availableTags = useMemo(() => {
    return filteredTags.filter(
      (tag) => !selectedTags.some((s) => s.id === tag.id)
    );
  }, [filteredTags, selectedTags]);

  const showCreateOption =
    tagInputValue &&
    !availableTags.some(
      (t) => t.name.toLowerCase() === tagInputValue.toLowerCase()
    ) &&
    !selectedTags.some(
      (t) => t.name.toLowerCase() === tagInputValue.toLowerCase()
    );

  return (
    <div>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={popoverOpen}
            className="w-full justify-between font-normal"
          >
            <span className="truncate">
              {selectedTags.length > 0
                ? selectedTags.map((t) => t.name).join(", ")
                : "Selecione ou crie tags..."}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput
              placeholder="Buscar ou criar tag..."
              value={tagInputValue}
              onValueChange={setTagInputValue}
            />
            <CommandList>
              {availableTags.length === 0 && !showCreateOption ? (
                <CommandEmpty>Nenhuma tag encontrada.</CommandEmpty>
              ) : null}
              <CommandGroup>
                {availableTags.map((tag) => (
                  <CommandItem
                    key={tag.id}
                    onSelect={() => handleTagSelect(tag)}
                  >
                    {tag.name}
                  </CommandItem>
                ))}
                {showCreateOption ? (
                  <CommandItem onSelect={() => handleCreateTag(tagInputValue)}>
                    Criar nova tag: "{tagInputValue}"
                  </CommandItem>
                ) : null}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <div className="flex flex-wrap gap-2 mt-2">
        {selectedTags.map((tag) => (
          <Badge key={tag.id} variant="secondary">
            {tag.name}
            <button
              type="button"
              onClick={() => handleTagRemove(tag.id)}
              className="ml-2 rounded-full outline-none hover:bg-destructive/80 p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
}
