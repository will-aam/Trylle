"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/src/lib/supabase-client";
import { useToast } from "@/src/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Plus, Trash2, Edit, Check, X } from "lucide-react";
import { Skeleton } from "@/src/components/ui/skeleton";

type TagGroup = {
  id: string;
  name: string;
  created_at: string;
};

export function TagGroupManager() {
  const supabase = createClient();
  const { toast } = useToast();

  const [groups, setGroups] = useState<TagGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [newGroupName, setNewGroupName] = useState("");
  const [editingGroup, setEditingGroup] = useState<TagGroup | null>(null);
  const [editingName, setEditingName] = useState("");

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("tag_groups")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      toast({
        title: "Erro ao carregar grupos",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setGroups(data || []);
    }
    setLoading(false);
  }, [supabase, toast]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleAddGroup = async () => {
    if (!newGroupName.trim()) return;
    const { data, error } = await supabase
      .from("tag_groups")
      .insert([{ name: newGroupName.trim() }])
      .select()
      .single();

    if (error) {
      toast({
        title: "Erro ao criar grupo",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setGroups([...groups, data].sort((a, b) => a.name.localeCompare(b.name)));
      setNewGroupName("");
      toast({ title: "Sucesso!", description: "Grupo de tags criado." });
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    const { error } = await supabase
      .from("tag_groups")
      .delete()
      .eq("id", groupId);
    if (error) {
      toast({
        title: "Erro ao excluir grupo",
        description: "Verifique se o grupo não está em uso e tente novamente.",
        variant: "destructive",
      });
    } else {
      setGroups(groups.filter((g) => g.id !== groupId));
      toast({ title: "Sucesso!", description: "Grupo de tags excluído." });
    }
  };

  const handleUpdateGroup = async () => {
    if (!editingGroup || !editingName.trim()) return;

    const { data, error } = await supabase
      .from("tag_groups")
      .update({ name: editingName.trim() })
      .eq("id", editingGroup.id)
      .select()
      .single();

    if (error) {
      toast({
        title: "Erro ao atualizar grupo",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setGroups(
        groups
          .map((g) => (g.id === editingGroup.id ? data : g))
          .sort((a, b) => a.name.localeCompare(b.name))
      );
      toast({ title: "Sucesso!", description: "Grupo de tags atualizado." });
      setEditingGroup(null);
      setEditingName("");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grupos de Tags (Clusters)</CardTitle>
        <CardDescription>
          Organize suas tags em grupos para facilitar a descoberta de conteúdo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2 mb-4">
          <Input
            placeholder="Nome do novo grupo"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddGroup()}
          />
          <Button onClick={handleAddGroup}>
            <Plus className="mr-2 h-4 w-4" /> Adicionar Grupo
          </Button>
        </div>
        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-md" />
              ))
            : groups.map((group) => (
                <div
                  key={group.id}
                  className="flex items-center justify-between rounded-md border p-2 bg-background hover:bg-muted/50"
                >
                  {editingGroup?.id === group.id ? (
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleUpdateGroup();
                        if (e.key === "Escape") setEditingGroup(null);
                      }}
                      className="h-8"
                    />
                  ) : (
                    <span className="text-sm font-medium pl-2">
                      {group.name}
                    </span>
                  )}
                  <div className="flex items-center">
                    {editingGroup?.id === group.id ? (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleUpdateGroup}
                          className="h-8 w-8"
                        >
                          <Check className="h-4 w-4 text-green-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingGroup(null)}
                          className="h-8 w-8"
                        >
                          <X className="h-4 w-4 text-red-500" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingGroup(group);
                            setEditingName(group.name);
                          }}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteGroup(group.id)}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
        </div>
      </CardContent>
    </Card>
  );
}
