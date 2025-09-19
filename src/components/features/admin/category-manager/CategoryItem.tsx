"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
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
import { Pencil, Trash2, ChevronDown, Plus } from "lucide-react"; // Removido AlertCircle
import { Category, Subcategory } from "@/src/lib/types";
import { SubcategoryItem } from "./SubcategoryItem";

interface CategoryItemProps {
  category: Category;
  editingCategoryId: string | null;
  editingCategoryName: string;
  setEditingCategoryName: (name: string) => void;
  onEdit: (category: Category) => void;
  onUpdate: () => void;
  onCancelEdit: () => void;
  onDelete: (categoryId: string) => void;
  onAddSubcategory: (categoryId: string) => void;
  onAccordionChange: (categoryId: string) => void;
  onEditSubcategory: (subcategory: Subcategory) => void;
  newSubcategoryNames: { [key: string]: string };
  setNewSubcategoryNames: (names: { [key: string]: string }) => void;
}

export function CategoryItem({
  category,
  editingCategoryId,
  editingCategoryName,
  setEditingCategoryName,
  onEdit,
  onUpdate,
  onCancelEdit,
  onDelete,
  onAddSubcategory,
  onEditSubcategory,
  newSubcategoryNames,
  setNewSubcategoryNames,
}: CategoryItemProps) {
  const isEditing = editingCategoryId === category.id;

  return (
    <AccordionPrimitive.Item
      key={category.id}
      value={category.id}
      className="border rounded-md px-4 bg-muted/50"
    >
      <AccordionPrimitive.Header className="flex items-center w-full py-2">
        {isEditing ? (
          <div className="flex-1">
            <Input
              value={editingCategoryName}
              onChange={(e) => setEditingCategoryName(e.target.value)}
              className="h-9 font-semibold"
            />
          </div>
        ) : (
          <AccordionPrimitive.Trigger className="flex flex-1 items-center gap-3 text-left font-semibold group">
            <span>
              {category.name}
              <span className="ml-2 text-muted-foreground font-normal">
                ({category.episode_count})
              </span>
              {/* O ÍCONE AMARELO FOI REMOVIDO DAQUI */}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </AccordionPrimitive.Trigger>
        )}

        <div className="flex-shrink-0 ml-4">
          {isEditing ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={onUpdate}
                className="text-green-500 hover:text-green-700"
              >
                Salvar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancelEdit}
                className="text-red-500 hover:text-red-700"
              >
                Cancelar
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(category)}
                className="h-8 w-8"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. Isso excluirá
                      permanentemente a categoria "{category.name}" e TODAS as
                      suas subcategorias.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(category.id)}>
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </AccordionPrimitive.Header>
      <AccordionPrimitive.Content className="pt-2 pb-4">
        <div className="pl-4 mt-2 space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Nova subcategoria"
              className="h-9"
              value={newSubcategoryNames[category.id] || ""}
              onChange={(e) =>
                setNewSubcategoryNames({
                  ...newSubcategoryNames,
                  [category.id]: e.target.value,
                })
              }
              onKeyDown={(e) =>
                e.key === "Enter" && onAddSubcategory(category.id)
              }
            />
            <Button size="sm" onClick={() => onAddSubcategory(category.id)}>
              <Plus className="mr-1 h-4 w-4" /> Adicionar
            </Button>
          </div>

          {category.subcategoriesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-9 w-full rounded-md bg-muted animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {category.subcategories?.map((sub) => (
                <SubcategoryItem
                  key={sub.id}
                  subcategory={sub}
                  onEdit={onEditSubcategory}
                />
              ))}
            </div>
          )}
        </div>
      </AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  );
}
