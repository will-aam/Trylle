"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Plus } from "lucide-react";
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

export function TagManager() {
  const supabase = createClient();
  const { toast } = useToast();

  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTagName, setNewTagName] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("tags")
      .select("*")
      .order("name");

    if (error) {
      console.error("Erro ao buscar tags:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as tags.",
        variant: "destructive",
      });
    } else {
      setTags(data || []);
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
      setTags([...tags, data].sort((a, b) => a.name.localeCompare(b.name)));
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
          Currently, there are <strong>{tags.length}</strong> registered tags.
        </CardDescription>
        <div className="flex space-x-2 mt-4">
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
      </CardHeader>
      <CardContent>
        <div className="border rounded-md p-4 space-y-2 max-h-[60vh] overflow-y-auto">
          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <AlertDialog key={tag.id}>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <AlertDialogTrigger asChild>
                          <Badge
                            variant="secondary"
                            className="cursor-pointer hover:bg-destructive/80"
                          >
                            {tag.name}
                          </Badge>
                        </AlertDialogTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Clique para excluir a tag</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Excluir a tag "{tag.name}"?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação não pode ser desfeita. A tag será removida de
                        todos os episódios que a utilizam.
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
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma tag criada.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
