// src/components/features/admin/program-management/ProgramTable.tsx
"use client";

import React, { useState, useEffect } from "react";
import { ProgramWithRelations, SortDirection } from "@/src/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Dialog, DialogContent } from "@/src/components/ui/dialog";
import { cn } from "@/src/lib/utils";
import { Pencil, Trash2, Eye, ImageIcon } from "lucide-react";
import Image from "next/image";

export interface ProgramTableProps {
  programs: ProgramWithRelations[];
  isLoading: boolean;
  onEdit: (program: ProgramWithRelations) => void;
  onDelete: (program: ProgramWithRelations) => void;
}

// Hook para detectar se estamos em mobile
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Verificação inicial
    checkIfMobile();

    // Adicionar listener para mudanças de tamanho
    window.addEventListener("resize", checkIfMobile);

    // Limpar listener
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  return isMobile;
}

export function ProgramTable({
  programs,
  isLoading,
  onEdit,
  onDelete,
}: ProgramTableProps) {
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const isMobile = useIsMobile();

  // Versão mobile simplificada
  if (isMobile) {
    return (
      <div className="space-y-2">
        <div className="w-full">
          {programs.map((program) => (
            <div
              key={program.id}
              className="flex items-center justify-between p-4 border-b"
            >
              <div className="flex-1 pr-4">
                <h3 className="font-medium text-sm">{program.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {program.categories?.name || "Sem Categoria"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {program._count?.episodes ?? 0} episódios
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onEdit(program)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => onDelete(program)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {programs.length === 0 && !isLoading && (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Nenhum programa para exibir.
            </div>
          )}
        </div>

        {/* Modal para visualizar imagem */}
        <Dialog
          open={!!viewingImage}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setViewingImage(null);
            }
          }}
        >
          <DialogContent className="max-w-xl">
            {viewingImage && (
              <Image
                src={viewingImage}
                alt="Capa do Programa"
                width={1280}
                height={720}
                className="rounded-md object-contain"
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Versão desktop
  return (
    <div className="space-y-2">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Título</TableHead>
              <TableHead className="w-[200px]">Categoria</TableHead>
              <TableHead className="w-[150px]">Episódios</TableHead>
              <TableHead className="w-[150px]">Capa</TableHead>
              <TableHead className="text-right w-[150px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? // Skeletons para estado de carregamento
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              : programs.map((program) => (
                  <TableRow key={program.id}>
                    <TableCell className="font-medium">
                      <div className="truncate" title={program.title}>
                        {program.title}
                      </div>
                    </TableCell>
                    <TableCell>
                      {program.categories?.name || "Sem Categoria"}
                    </TableCell>
                    <TableCell>
                      {program._count?.episodes ?? 0} episódios
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!program.image_url}
                        onClick={() => setViewingImage(program.image_url)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Ver Imagem
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onEdit(program)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => onDelete(program)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            {programs.length === 0 && !isLoading && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  Nenhum programa para exibir.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal para visualizar imagem */}
      <Dialog
        open={!!viewingImage}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setViewingImage(null);
          }
        }}
      >
        <DialogContent className="max-w-xl">
          {viewingImage && (
            <Image
              src={viewingImage}
              alt="Capa do Programa"
              width={1280}
              height={720}
              className="rounded-md object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
