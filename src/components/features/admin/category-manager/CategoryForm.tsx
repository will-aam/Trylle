// src/components/features/admin/category-manager/CategoryForm.tsx

"use client";

import { useForm, Controller } from "react-hook-form";
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
import { ThemeSelector } from "./ThemeSelector"; // Importando nosso seletor

interface CategoryFormProps {
  defaultValues?: Partial<CategoryFormData>;
  onSubmit: (data: CategoryFormData) => void;
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
      color_theme: null, // Garantir que o valor padrão é nulo
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

        {/* SELETOR DE TEMA INTEGRADO */}
        <Controller
          control={form.control}
          name="color_theme"
          render={({ field }) => (
            <ThemeSelector
              value={field.value}
              onChange={(themeName) => field.onChange(themeName)}
            />
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
