// src/components/features/admin/tag-manager/TagPagination.tsx
"use client";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  PaginationFirst, // <-- ADICIONADO
  PaginationLast, // <-- ADICIONADO
} from "../../../ui/pagination";

interface TagPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function TagPagination({
  currentPage,
  totalPages,
  onPageChange,
}: TagPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-4 flex justify-center">
      <Pagination>
        <PaginationContent>
          {/* BOTÃO "INÍCIO" ADICIONADO */}
          <PaginationItem>
            <PaginationFirst
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onPageChange(1);
              }}
              className={
                currentPage === 1
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>

          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onPageChange(currentPage - 1);
              }}
              className={
                currentPage === 1
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>
          <PaginationItem>
            <span className="text-sm px-4">
              Página {currentPage} de {totalPages}
            </span>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onPageChange(currentPage + 1);
              }}
              className={
                currentPage === totalPages
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>

          {/* BOTÃO "ÚLTIMO" ADICIONADO */}
          <PaginationItem>
            <PaginationLast
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onPageChange(totalPages);
              }}
              className={
                currentPage === totalPages
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
