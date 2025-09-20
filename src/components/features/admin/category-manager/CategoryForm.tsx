// src/components/features/admin/category-manager/CategoryForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { categoryFormSchema, type CategoryFormData } from "@/src/lib/schemas";

interface CategoryFormProps {
  // Passamos valores default para o caso de edição
  defaultValues?: Partial<CategoryFormData>;
  // Função que será chamada no submit com os dados validados
  onSubmit: (data: CategoryFormData) => void;
  // Estado para controlar o carregamento do botão de submit
  isLoading?: boolean;
}

export function CategoryForm({
  defaultValues,
  onSubmit,
  isLoading = false,
}: CategoryFormProps) {
  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Categoria</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Tecnologia" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Salvando..." : "Salvar Categoria"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
