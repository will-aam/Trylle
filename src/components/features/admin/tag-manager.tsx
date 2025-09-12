"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { createClient } from "@/src/lib/supabase-client";
import { Tag } from "@/src/lib/types";
import { useToast } from "@/src/hooks/use-toast";
import { Plus, Search, Download, Upload } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/src/components/ui/alert-dialog";
import { Badge } from "@/src/components/ui/badge";
import { cn } from "@/src/lib/utils";

// Define a more specific type for tags that include the episode count
type TagWithCount = Tag & {
  episode_tags: { count: number }[];
};

// Renamed component to reflect its single responsibility
export function TagManager() {
  const supabase = createClient();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref para o input de arquivo

  const [tags, setTags] = useState<TagWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTagName, setNewTagName] = useState("");
  const [tagSearchTerm, setTagSearchTerm] = useState("");

  const filteredTags = useMemo(() => {
    if (!tagSearchTerm.trim()) {
      return tags;
    }
    return tags.filter((tag) =>
      tag.name.toLowerCase().includes(tagSearchTerm.toLowerCase())
    );
  }, [tags, tagSearchTerm]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    // Fetch tags and the count of related episodes
    const { data, error } = await supabase
      .from("tags")
      .select("*, episode_tags(count)")
      .order("name");

    if (error) {
      console.error("Erro ao buscar tags:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as tags.",
        variant: "destructive",
      });
    } else {
      setTags((data as TagWithCount[]) || []);
    }
    setLoading(false);
  }, [supabase, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddTag = async () => {
    if (!newTagName.trim()) return;
    const { data, error } = await supabase
      .from("tags")
      .insert([{ name: newTagName.trim().toLowerCase() }])
      .select()
      .single();

    if (error) {
      toast({
        title: "Erro ao criar tag",
        description: "Talvez essa tag já exista.",
        variant: "destructive",
      });
    } else {
      // Create a new TagWithCount object to add to the state
      const newTag: TagWithCount = { ...data, episode_tags: [{ count: 0 }] };
      setTags([...tags, newTag].sort((a, b) => a.name.localeCompare(b.name)));
      setNewTagName("");
      toast({ title: "Sucesso!", description: "Tag criada." });
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    const { error } = await supabase.from("tags").delete().eq("id", tagId);
    if (error) {
      toast({
        title: "Erro ao excluir tag",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setTags(tags.filter((t) => t.id !== tagId));
      toast({ title: "Sucesso!", description: "Tag excluída." });
    }
  };

  const handleExportTags = async () => {
    const { data: tagsToExport, error } = await supabase
      .from("tags")
      .select("name")
      .order("name");

    if (error) {
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível buscar as tags.",
        variant: "destructive",
      });
      return;
    }

    const csvHeader = "name\n";
    const csvRows = tagsToExport.map((tag) => `"${tag.name}"`).join("\n");
    const csvContent = csvHeader + csvRows;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "playcast_tags.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileImport = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const lines = text
        .split("\n")
        .map((line) => line.trim().toLowerCase())
        .filter(Boolean);

      if (lines.length === 0) {
        toast({ title: "Arquivo vazio", variant: "destructive" });
        return;
      }

      // Remove o header se existir
      const header = lines[0].toLowerCase();
      const tagNames =
        header === "name" || header === '"name"' ? lines.slice(1) : lines;

      const uniqueTagNames = [...new Set(tagNames)].filter((name) => name);

      const { data: existingTags, error: fetchError } = await supabase
        .from("tags")
        .select("name")
        .in("name", uniqueTagNames);

      if (fetchError) {
        toast({
          title: "Erro ao verificar tags existentes",
          variant: "destructive",
        });
        return;
      }

      const existingTagNames = new Set(existingTags.map((t) => t.name));
      const newTagsToInsert = uniqueTagNames
        .filter((name) => !existingTagNames.has(name))
        .map((name) => ({ name }));

      if (newTagsToInsert.length === 0) {
        toast({
          title: "Nenhuma nova tag para importar",
          description: "Todas as tags do arquivo já existem.",
        });
        return;
      }

      const { error: insertError } = await supabase
        .from("tags")
        .insert(newTagsToInsert);

      if (insertError) {
        toast({
          title: "Erro ao importar tags",
          description: insertError.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Importação concluída!",
          description: `${newTagsToInsert.length} novas tags foram adicionadas. ${existingTagNames.size} tags já existiam.`,
        });
        fetchData(); // Atualiza a lista
      }
    };
    reader.readAsText(file);

    // Reseta o input para permitir o upload do mesmo arquivo novamente
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (loading) {
    return <p>Carregando tags...</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tags</CardTitle>
        <CardDescription>
          Atualmente, existem <strong>{tags.length}</strong> tags cadastradas.
        </CardDescription>
        <div className="flex flex-col gap-2 mt-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar tags..."
              value={tagSearchTerm}
              onChange={(e) => setTagSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="flex space-x-2">
              <Input
                placeholder="Nome da nova tag"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
              />
              <Button onClick={handleAddTag}>
                <Plus className="mr-2 h-4 w-4" /> Adicionar
              </Button>
            </div>
            <div className="flex space-x-2">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".csv"
                onChange={handleFileImport}
              />
              <Button
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" /> Importar CSV
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleExportTags}
              >
                <Download className="mr-2 h-4 w-4" /> Exportar CSV
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md p-4 space-y-2 max-h-[60vh] overflow-y-auto">
          {filteredTags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {filteredTags.map((tag) => {
                const count = tag.episode_tags[0]?.count || 0;
                return (
                  <AlertDialog key={tag.id}>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <AlertDialogTrigger asChild>
                            <Badge
                              variant="secondary"
                              className={cn(
                                "cursor-pointer hover:bg-destructive/80",
                                {
                                  "border-red-500 bg-red-100 text-red-800 hover:bg-red-200/80 dark:bg-red-700 dark:text-red-200 dark:border-red-500":
                                    count === 0,
                                }
                              )}
                            >
                              {tag.name}
                              {` (${count})`}
                            </Badge>
                          </AlertDialogTrigger>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {count === 0
                              ? "Tag não utilizada. Clique para excluir."
                              : "Clique para excluir a tag."}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Excluir a tag "{tag.name}"?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. A tag será removida
                          de todos os episódios que a utilizam.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteTag(tag.id)}
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              {tagSearchTerm
                ? "Nenhuma tag encontrada."
                : "Nenhuma tag criada."}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
