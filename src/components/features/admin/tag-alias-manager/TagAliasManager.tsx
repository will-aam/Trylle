"use client";

import { useState, useEffect, useCallback } from "react";
// 1. AQUI ESTÁ A MUDANÇA: Importe a nova função
import { createSupabaseBrowserClient } from "@/src/lib/supabase-client";
import { useToast } from "@/src/hooks/use-toast";
import { Tag } from "@/src/lib/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/src/components/ui/command";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Plus, Trash2, ChevronsUpDown, Check, ArrowRight } from "lucide-react";
import { ConfirmationDialog } from "@/src/components/ui/confirmation-dialog";

type TagAlias = {
  id: string;
  alias: string;
  tag_id: string;
  tags: { name: string };
};

export function TagAliasManager() {
  // 2. E AQUI: Use a nova função para criar o cliente
  const supabase = createSupabaseBrowserClient();
  const { toast } = useToast();

  const [aliases, setAliases] = useState<TagAlias[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAlias, setNewAlias] = useState("");
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [aliasesRes, tagsRes] = await Promise.all([
        supabase.from("tag_aliases").select(`*, tags (name)`).order("alias"),
        supabase.from("tags").select("*").order("name"),
      ]);

      if (aliasesRes.error) throw aliasesRes.error;
      if (tagsRes.error) throw tagsRes.error;

      setAliases(aliasesRes.data || []);
      setAllTags(tagsRes.data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [supabase, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddAlias = async () => {
    if (!newAlias.trim() || !selectedTag) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o sinônimo e selecione a tag principal.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("tag_aliases")
      .insert([
        { alias: newAlias.trim().toLowerCase(), tag_id: selectedTag.id },
      ]);

    if (error) {
      toast({
        title: "Erro ao criar sinônimo",
        description: "Verifique se este sinônimo já não existe.",
        variant: "destructive",
      });
    } else {
      toast({ title: "Sucesso!", description: "Sinônimo criado." });
      setNewAlias("");
      setSelectedTag(null);
      fetchData();
    }
  };

  const handleDeleteAlias = async (aliasId: string) => {
    const { error } = await supabase
      .from("tag_aliases")
      .delete()
      .eq("id", aliasId);

    if (error) {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Sucesso!", description: "Sinônimo excluído." });
      setAliases(aliases.filter((a) => a.id !== aliasId));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciador de Sinônimos (Aliases)</CardTitle>
        <CardDescription>
          Mapeie termos de busca alternativos para suas tags principais para
          melhorar os resultados da pesquisa.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-6 p-4 border rounded-lg">
          <div className="space-y-2">
            <Label htmlFor="alias-name">Sinônimo</Label>
            <Input
              id="alias-name"
              placeholder="Digite o termo alternativo..."
              value={newAlias}
              onChange={(e) => setNewAlias(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Tag Principal</Label>
            <Popover open={isComboboxOpen} onOpenChange={setIsComboboxOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={isComboboxOpen}
                  className="w-full justify-between"
                >
                  {selectedTag
                    ? selectedTag.name
                    : "Selecione a tag principal..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0">
                <Command>
                  <CommandInput placeholder="Buscar tag..." />
                  <CommandList>
                    <CommandEmpty>Nenhuma tag encontrada.</CommandEmpty>
                    <CommandGroup>
                      {allTags.map((tag) => (
                        <CommandItem
                          key={tag.id}
                          value={tag.name}
                          onSelect={() => {
                            setSelectedTag(tag);
                            setIsComboboxOpen(false);
                          }}
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              selectedTag?.id === tag.id
                                ? "opacity-100"
                                : "opacity-0"
                            }`}
                          />
                          {tag.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <Button onClick={handleAddAlias} className="w-full md:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Adicionar Sinônimo
          </Button>
        </div>

        <h3 className="text-md font-semibold mb-2">Sinônimos Existentes</h3>
        <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2 border rounded-lg p-2">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))
          ) : aliases.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center p-4">
              Nenhum sinônimo cadastrado.
            </p>
          ) : (
            aliases.map((alias) => (
              <div
                key={alias.id}
                className="flex items-center justify-between rounded-md border p-3 bg-background hover:bg-muted/50"
              >
                <div className="flex items-center gap-2 font-mono text-sm">
                  <span className="font-semibold text-primary">
                    {alias.alias}
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">{alias.tags.name}</span>
                </div>
                <ConfirmationDialog
                  title="Delete Synonym"
                  description={`Are you sure you want to delete the synonym "${alias.alias}"? This action cannot be undone.`}
                  onConfirm={() => handleDeleteAlias(alias.id)}
                >
                  {(open) => (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={open}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </ConfirmationDialog>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
