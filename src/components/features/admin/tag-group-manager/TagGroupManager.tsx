// src/components/features/admin/tag-group-manager/TagGroupManager.tsx

"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { createSupabaseBrowserClient } from "@/src/lib/supabase-client";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";
import { Badge } from "@/src/components/ui/badge";
import { ConfirmationDialog } from "@/src/components/ui/confirmation-dialog";
import { getPaginatedTagGroups } from "@/src/app/admin/tags/actions";
import { TagPagination } from "../tag-manager/TagPagination";
import { Tag } from "@/src/lib/types";

type TagGroup = {
  id: string;
  name: string;
  created_at: string;
  tags: Tag[];
};

const PAGE_SIZE = 10;

export function TagGroupManager() {
  const supabase = createSupabaseBrowserClient();
  const { toast } = useToast();

  const [groups, setGroups] = useState<TagGroup[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isPending, startTransition] = useTransition();

  const [newGroupName, setNewGroupName] = useState("");
  const [editingGroup, setEditingGroup] = useState<TagGroup | null>(null);
  const [editingName, setEditingName] = useState("");

  // --- NOVO ESTADO PARA CONTROLAR O DIÁLOGO DE CONFIRMAÇÃO ---
  const [groupToDelete, setGroupToDelete] = useState<TagGroup | null>(null);

  const fetchGroups = useCallback(() => {
    startTransition(async () => {
      const { groups: fetchedGroups, count } = await getPaginatedTagGroups(
        currentPage,
        PAGE_SIZE
      );
      setGroups(fetchedGroups as TagGroup[]);
      setTotalCount(count);
    });
  }, [currentPage]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleAddGroup = async () => {
    if (!newGroupName.trim()) return;
    const { error } = await supabase
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
      setNewGroupName("");
      toast({ title: "Sucesso!", description: "Grupo de tags criado." });
      fetchGroups();
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
      toast({ title: "Sucesso!", description: "Grupo de tags excluído." });
      fetchGroups();
    }
  };

  const handleUpdateGroup = async () => {
    if (!editingGroup || !editingName.trim()) return;
    const { error } = await supabase
      .from("tag_groups")
      .update({ name: editingName.trim() })
      .eq("id", editingGroup.id)
      .select("*, tags(id, name)")
      .single();

    if (error) {
      toast({
        title: "Erro ao atualizar grupo",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Sucesso!", description: "Grupo de tags atualizado." });
      setEditingGroup(null);
      setEditingName("");
      fetchGroups();
    }
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Grupos de Tags (Clusters)</CardTitle>
          <CardDescription>
            Organize suas tags em grupos para facilitar a descoberta de
            conteúdo.
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

          <div className="min-h-[400px]">
            <Accordion type="multiple" className="w-full">
              {isPending
                ? Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-md mb-1" />
                  ))
                : groups.map((group) => (
                    <AccordionItem
                      key={group.id}
                      value={group.id}
                      className="border-b"
                    >
                      <div className="flex items-center w-full">
                        <AccordionTrigger className="flex-grow text-left hover:no-underline px-4 py-3">
                          {editingGroup?.id === group.id ? (
                            <Input
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleUpdateGroup();
                                if (e.key === "Escape") setEditingGroup(null);
                                e.stopPropagation();
                              }}
                              className="h-8"
                            />
                          ) : (
                            <span className="text-sm font-medium">
                              {group.name}
                            </span>
                          )}
                        </AccordionTrigger>
                        <div className="flex items-center pr-2">
                          {editingGroup?.id === group.id ? (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateGroup();
                                }}
                                className="h-8 w-8"
                              >
                                <Check className="h-4 w-4 text-green-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingGroup(null);
                                }}
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
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingGroup(group);
                                  setEditingName(group.name);
                                }}
                                className="h-8 w-8"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              {/* --- BOTÃO DE EXCLUIR MODIFICADO --- */}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setGroupToDelete(group); // Define qual grupo será excluído
                                }}
                                className="h-8 w-8 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      <AccordionContent className="px-4 pb-3">
                        {group.tags && group.tags.length > 0 ? (
                          <div className="flex flex-wrap gap-2 pt-2">
                            {group.tags.map((tag) => (
                              <Badge key={tag.id} variant="secondary">
                                {tag.name}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground italic pt-2">
                            Nenhuma tag associada a este grupo.
                          </p>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
            </Accordion>
          </div>

          <div className="mt-4 flex justify-center">
            <TagPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* --- DIÁLOGO MOVIDO PARA FORA DO LOOP E CONTROLADO POR ESTADO --- */}
      <ConfirmationDialog
        isOpen={!!groupToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setGroupToDelete(null);
          }
        }}
        title="Excluir Grupo de Tags"
        description={
          groupToDelete
            ? `Você tem certeza que deseja excluir o grupo "${groupToDelete.name}"? Esta ação não pode ser desfeita.`
            : ""
        }
        onConfirm={() => {
          if (groupToDelete) {
            handleDeleteGroup(groupToDelete.id);
            setGroupToDelete(null); // Fecha o diálogo após a confirmação
          }
        }}
      />
    </>
  );
}
