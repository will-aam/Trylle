"use client";

import { useState, useEffect } from "react";
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
    setPopoverOpen(false);
  };

  const handleTagRemove = (tagId: string) => {
    onSelectedTagsChange(selectedTags.filter((t) => t.id !== tagId));
  };

  const handleCreateTag = async (tagName: string) => {
    const name = tagName.trim().toLowerCase();
    if (
      !name ||
      selectedTags.some((t) => t.name === name) ||
      allTags.some((t) => t.name === name)
    ) {
      setPopoverOpen(false);
      return;
    }
    const { data, error } = await supabase
      .from("tags")
      .insert([{ name }])
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
    }
    setPopoverOpen(false);
  };

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
              onValueChange={setTagInputValue}
            />
            <CommandList>
              <CommandEmpty onSelect={() => handleCreateTag(tagInputValue)}>
                Criar nova tag: "{tagInputValue}"
              </CommandEmpty>
              <CommandGroup>
                {allTags
                  .filter((tag) => !selectedTags.some((s) => s.id === tag.id))
                  .map((tag) => (
                    <CommandItem
                      key={tag.id}
                      onSelect={() => handleTagSelect(tag)}
                    >
                      {tag.name}
                    </CommandItem>
                  ))}
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
