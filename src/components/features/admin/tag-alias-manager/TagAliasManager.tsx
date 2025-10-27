"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { Badge } from "@/src/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  getPaginatedTagAliases,
  getAllTags,
  createTagAliasAction,
  deleteTagAliasAction,
} from "@/src/app/admin/tags/actions";
import { TagPagination } from "../tag-manager/TagPagination";
import { Tag } from "@/src/lib/types";
import { toast } from "@/src/lib/safe-toast";
import { Loader2, Plus, Trash2 } from "lucide-react";
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

type TagAliasWithTagName = {
  id: string;
  alias: string;
  tag_id: string;
  created_at: string;
  tags: {
    name: string;
  } | null;
};

const PAGE_SIZE = 10;

export function TagAliasManager() {
  const [aliases, setAliases] = useState<TagAliasWithTagName[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [isFormPending, startFormTransition] = useTransition();

  const [newAliasName, setNewAliasName] = useState("");
  const [newAliasTagId, setNewAliasTagId] = useState("");

  const fetchAliases = () => {
    startTransition(async () => {
      const { aliases: fetchedAliases, count } = await getPaginatedTagAliases(
        currentPage,
        PAGE_SIZE
      );
      const formattedAliases = fetchedAliases.map((alias: any) => ({
        ...alias,
        tags: alias.tags ? alias.tags : { name: "Tag não encontrada" },
      }));
      setAliases(formattedAliases);
      setTotalCount(count ?? 0);
    });
  };

  const fetchAllTags = async () => {
    const result = await getAllTags();
    if (!result.success) {
      toast.error("Erro ao buscar tags", { description: result.error });
    } else {
      setAllTags(result.tags);
    }
  };

  useEffect(() => {
    fetchAliases();
  }, [currentPage]);

  useEffect(() => {
    fetchAllTags();
  }, []);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCreateAlias = () => {
    if (!newAliasName.trim() || !newAliasTagId) {
      toast.error("Formulário inválido", {
        description: "Preencha o nome do sinônimo e a tag principal.",
      });
      return;
    }

    startFormTransition(async () => {
      const result = await createTagAliasAction({
        alias: newAliasName.trim(),
        tag_id: newAliasTagId,
      });

      if (result.success) {
        toast.success("Sinônimo criado!");
        setNewAliasName("");
        setNewAliasTagId("");
        fetchAliases();
      } else {
        toast.error("Erro ao criar", { description: result.error });
      }
    });
  };

  const handleDeleteAlias = (aliasId: string) => {
    startTransition(async () => {
      const result = await deleteTagAliasAction(aliasId);
      if (result.success) {
        toast.success("Sinônimo deletado");
        if (aliases.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          fetchAliases();
        }
      } else {
        toast.error("Erro ao deletar", { description: result.error });
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciador de Sinônimos de Tags</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 border rounded-lg bg-muted/50">
          <h3 className="font-semibold text-lg mb-3">Novo Sinônimo</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Nome do sinônimo (ex: 'IA')"
              value={newAliasName}
              onChange={(e) => setNewAliasName(e.target.value)}
              disabled={isFormPending}
              className="flex-1"
            />
            <Select
              value={newAliasTagId}
              onValueChange={setNewAliasTagId}
              disabled={isFormPending || allTags.length === 0}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Selecione a Tag Principal..." />
              </SelectTrigger>
              <SelectContent>
                {allTags.length === 0 && (
                  <SelectItem value="loading" disabled>
                    Carregando tags...
                  </SelectItem>
                )}
                {allTags.map((tag) => (
                  <SelectItem key={tag.id} value={tag.id}>
                    {tag.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleCreateAlias} disabled={isFormPending}>
              {isFormPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              <span className="ml-2">Criar</span>
            </Button>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sinônimo (Alias)</TableHead>
                <TableHead>Tag Principal</TableHead>
                <TableHead>Data de Criação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isPending && aliases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : aliases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    Nenhum sinônimo encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                aliases.map((alias) => (
                  <TableRow key={alias.id}>
                    <TableCell className="font-medium">{alias.alias}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{alias.tags?.name}</Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(alias.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={isPending}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. O sinônimo "
                              {alias.alias}" será permanentemente deletado.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteAlias(alias.id)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Deletar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter>
        <TagPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </CardFooter>
    </Card>
  );
}
