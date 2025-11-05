// src/components/features/admin/episode-management/episode-table-pagination.tsx
"use client";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationFirst, // <-- ADICIONADO
  PaginationLast, // <-- ADICIONADO
} from "@/src/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";

interface EpisodeTablePaginationProps {
  currentPage: number;
  totalCount: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  setItemsPerPage: (value: number) => void;
  className?: string;
  isLoading?: boolean;
  /**
   * Se quiser exibir primeiro e último (atualmente mantive só prev/next)
   */
  showEdgeButtons?: boolean;
}

export function EpisodeTablePagination({
  currentPage,
  totalCount,
  itemsPerPage,
  onPageChange,
  setItemsPerPage,
  className,
  isLoading = false,
  showEdgeButtons = false,
}: EpisodeTablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));

  const handlePrevious = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  const handleFirst = () => onPageChange(1);
  const handleLast = () => onPageChange(totalPages);

  // Índices exibidos (1-based)
  const startIndex =
    totalCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endIndex =
    totalCount === 0 ? 0 : Math.min(currentPage * itemsPerPage, totalCount);

  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
      aria-label="Controle de paginação"
    >
      {/* Seleção de itens por página */}
      <div className="grid w-full max-w-max-cols-[auto_auto_auto] grid-cols-3 items-center gap-2">
        <label htmlFor="items-per-page" className="text-muted-foreground">
          Itens por página
        </label>
        <Select
          value={String(itemsPerPage)}
          onValueChange={(value) => setItemsPerPage(Number(value))}
          disabled={isLoading}
        >
          <SelectTrigger
            id="items-per-page"
            className="h-8 w-[90px]"
            aria-label="Itens por página"
          >
            <SelectValue placeholder={itemsPerPage} />
          </SelectTrigger>
          <SelectContent>
            {[5, 10, 25, 50].map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Navegação de páginas */}
      <Pagination>
        <PaginationContent className="flex items-center gap-1">
          {/* BOTÃO "INÍCIO" ADICIONADO */}
          <PaginationItem>
            <PaginationFirst
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleFirst();
              }}
              className={cn(
                currentPage === 1 || isLoading
                  ? "pointer-events-none opacity-50"
                  : ""
              )}
            />
          </PaginationItem>

          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handlePrevious();
              }}
              aria-label="Página anterior"
              className={cn(
                currentPage === 1 || isLoading
                  ? "pointer-events-none opacity-50"
                  : ""
              )}
            >
              <ChevronLeft className="h-4 w-4" />
            </PaginationPrevious>
          </PaginationItem>

          <PaginationItem>
            <span className="px-2 text-sm tabular-nums">
              Página {currentPage} de {totalPages}
            </span>
          </PaginationItem>

          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleNext();
              }}
              aria-label="Próxima página"
              className={cn(
                currentPage === totalPages || isLoading
                  ? "pointer-events-none opacity-50"
                  : ""
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </PaginationNext>
          </PaginationItem>

          {/* BOTÃO "ÚLTIMO" ADICIONADO */}
          <PaginationItem>
            <PaginationLast
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleLast();
              }}
              className={cn(
                currentPage === totalPages || isLoading
                  ? "pointer-events-none opacity-50"
                  : ""
              )}
            />
          </PaginationItem>

          {showEdgeButtons && (
            <PaginationItem>
              <Button
                variant="outline"
                size="icon"
                disabled={currentPage === 1 || isLoading}
                onClick={handleFirst}
                aria-label="Primeira página"
              >
                «
              </Button>
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    </div>
  );
}
