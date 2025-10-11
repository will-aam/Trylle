// src/components/features/admin/program-management/useProgramManager.ts

"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/src/hooks/use-toast";
import { ProgramWithRelations } from "@/src/lib/types";
import { listProgramsAction } from "@/src/app/admin/programs/actions";

export function useProgramManager() {
  const { toast } = useToast();

  const [programs, setPrograms] = useState<ProgramWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(6); // 6 cards por página (2 linhas de 3)

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listProgramsAction({
        page: currentPage,
        perPage: itemsPerPage,
      });

      if (!result.success || !result.data) {
        throw new Error(result.error || "Falha ao listar programas.");
      }

      setPrograms(result.data as ProgramWithRelations[]);
      setTotalCount(result.count ?? 0);
    } catch (error: any) {
      toast({
        title: "Erro ao buscar dados",
        description: error.message || "Não foi possível carregar os programas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return {
    programs,
    loading,
    currentPage,
    totalCount,
    itemsPerPage,
    fetchData, // Para forçar a atualização após criar/editar/deletar
    handlePageChange,
  };
}
