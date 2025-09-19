"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/src/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/src/components/ui/pagination";
import { CategoryListSkeleton } from "./CategoryListSkeleton";
import { CategoryHeader } from "./CategoryHeader";
import { CategoryItem } from "./CategoryItem";
import { useCategoryManager } from "@/src/components/features/admin/category-manager/useCategoryManager";
import { SubcategoryActionsModal } from "./SubcategoryActionsModal";
import { Category } from "@/src/lib/types"; // Adicione esta importação

export function CategoryManager() {
  const {
    categories,
    loading,
    newCategoryName,
    setNewCategoryName,
    newSubcategoryNames,
    setNewSubcategoryNames,
    editingCategoryId,
    setEditingCategoryId,
    editingCategoryName,
    setEditingCategoryName,
    categorySearchTerm,
    setCategorySearchTerm,
    debouncedSearchTerm,
    open,
    setOpen,
    sortOrder,
    setSortOrder,
    sortType,
    setSortType,
    selectedSubcategory,
    setSelectedSubcategory,
    isModalOpen,
    setIsModalOpen,
    currentPage,
    setCurrentPage,
    totalCount,
    itemsPerPage,
    sortedCategories,
    handleAddCategory,
    handleDeleteCategory,
    handleAccordionChange,
    handleAddSubcategory,
    handleUpdateSubcategory,
    handleDeleteSubcategory,
    handleOpenModal,
    handleCloseModal,
    handleUpdateCategory,
    startEditing,
    cancelEditing,
    handlePageChange,
  } = useCategoryManager();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Categorias e Subcategorias</CardTitle>
        <CardDescription>Gerencie a taxonomia do seu conteúdo.</CardDescription>
        <CategoryHeader
          categorySearchTerm={categorySearchTerm}
          setCategorySearchTerm={setCategorySearchTerm}
          categories={categories}
          open={open}
          setOpen={setOpen}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          sortType={sortType}
          setSortType={setSortType}
          newCategoryName={newCategoryName}
          setNewCategoryName={setNewCategoryName}
          handleAddCategory={handleAddCategory}
        />
      </CardHeader>
      <CardContent>
        {loading ? (
          <CategoryListSkeleton />
        ) : (
          <AccordionPrimitive.Root
            type="single"
            collapsible
            className="w-full space-y-2"
            onValueChange={handleAccordionChange}
          >
            {sortedCategories.length > 0 ? (
              sortedCategories.map((category: Category) => (
                <CategoryItem
                  key={category.id}
                  category={category}
                  editingCategoryId={editingCategoryId}
                  editingCategoryName={editingCategoryName}
                  setEditingCategoryName={setEditingCategoryName}
                  onEdit={startEditing}
                  onUpdate={handleUpdateCategory}
                  onCancelEdit={cancelEditing}
                  onDelete={handleDeleteCategory}
                  onAddSubcategory={handleAddSubcategory}
                  onAccordionChange={handleAccordionChange}
                  onEditSubcategory={handleOpenModal}
                  newSubcategoryNames={newSubcategoryNames}
                  setNewSubcategoryNames={setNewSubcategoryNames}
                />
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Nenhuma categoria encontrada.
                </p>
              </div>
            )}
          </AccordionPrimitive.Root>
        )}
      </CardContent>
      <SubcategoryActionsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        subcategory={selectedSubcategory}
        onEdit={handleUpdateSubcategory}
        onDelete={handleDeleteSubcategory}
      />
      {totalCount > itemsPerPage && (
        <CardFooter>
          <div className="mt-4 flex justify-center w-full">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(currentPage - 1);
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
                    Página {currentPage} de{" "}
                    {Math.ceil(totalCount / itemsPerPage)}
                  </span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(currentPage + 1);
                    }}
                    className={
                      currentPage === Math.ceil(totalCount / itemsPerPage)
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
