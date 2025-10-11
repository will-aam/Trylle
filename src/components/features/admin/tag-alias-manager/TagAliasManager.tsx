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
} from "@/src/components/ui/card";
import { getPaginatedTagAliases } from "@/src/app/admin/tags/actions";
import { TagPagination } from "../tag-manager/TagPagination"; // Reutilizaremos o componente de paginação

// Definindo um tipo para o alias, incluindo o nome da tag
type TagAliasWithTagName = {
  id: string;
  alias: string;
  tag_id: string;
  created_at: string;
  tags: {
    name: string;
  } | null;
};

const PAGE_SIZE = 10; // Definimos quantos itens por página

export function TagAliasManager() {
  const [aliases, setAliases] = useState<TagAliasWithTagName[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const { aliases: fetchedAliases, count } = await getPaginatedTagAliases(
        currentPage,
        PAGE_SIZE
      );
      // Ajustamos o tipo para corresponder ao que o componente espera
      const formattedAliases = fetchedAliases.map((alias: any) => ({
        ...alias,
        tags: alias.tags ? alias.tags : { name: "Tag não encontrada" },
      }));
      setAliases(formattedAliases);
      setTotalCount(count);
    });
  }, [currentPage]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciador de Sinônimos de Tags</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sinônimo (Alias)</TableHead>
                <TableHead>Tag Principal</TableHead>
                <TableHead>Data de Criação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isPending ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : (
                aliases.map((alias) => (
                  <TableRow key={alias.id}>
                    <TableCell>{alias.alias}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{alias.tags?.name}</Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(alias.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4">
          <TagPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </CardContent>
    </Card>
  );
}
