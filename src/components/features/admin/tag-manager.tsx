"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
import { Plus, Search } from "lucide-react";
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
                          onClick={() => handleDeleteTag(tag.id)} // O erro foi corrigido aqui
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
