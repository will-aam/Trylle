// src/components/features/admin/program-management/ProgramForm.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { programSchema, ProgramFormData } from "@/src/lib/schemas";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { useToast } from "@/src/hooks/use-toast";
import { Program, Category } from "@/src/lib/types";
import { saveProgram } from "@/src/app/admin/programs/actions"; // Assumindo que esta ação será criada/ajustada

// 1. NOVOS IMPORTS
import Image from "next/image";
import { UploadCloud, X, Image as ImageIcon } from "lucide-react";
import { useProgramImageUpload } from "@/src/hooks/useProgramImageUpload";
import { Progress } from "@/src/components/ui/progress";

interface ProgramFormProps {
  program: Program | null;
  categories: Category[];
  onSuccess: (program: Program) => void;
  onCancel: () => void;
}

export function ProgramForm({
  program,
  categories,
  onSuccess,
  onCancel,
}: ProgramFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // 2. NOVOS ESTADOS E REFS
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isRemovingImage, setIsRemovingImage] = useState(false);
  const formDataRef = useRef<ProgramFormData | null>(null);

  const form = useForm<ProgramFormData>({
    resolver: zodResolver(programSchema),
    defaultValues: {
      title: program?.title || "",
      description: program?.description || "",
      category_id: program?.category?.id || "",
      image_file: undefined, // Inicializa como undefined
    },
  });

  // 3. useEffect ATUALIZADO
  useEffect(() => {
    form.reset({
      title: program?.title || "",
      description: program?.description || "",
      category_id: program?.category?.id || "",
      image_file: undefined, // Sempre resetamos o input de arquivo
    });

    // Atualiza o preview e estados de controle
    const existingImageUrl = program?.image_url || null;
    setImagePreview(existingImageUrl);
    setUploadError(null);
    setIsRemovingImage(false);
  }, [program, form]);

  // 4. FUNÇÃO handleSave
  const handleSave = async (
    data: Omit<ProgramFormData, "image_file">,
    imageUrl: string | null
  ) => {
    setIsSubmitting(true);
    const result = await saveProgram({
      id: program?.id,
      title: data.title,
      description: data.description,
      category_id: data.category_id,
      image_url: imageUrl, // A nova URL!
    });

    if (result.success && result.program) {
      toast({ description: result.message });
      onSuccess(result.program);
    } else {
      toast({
        title: "Erro ao salvar",
        description: result.message || "Não foi possível salvar o programa.", // CORRIGIDO: error -> message
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  };

  // 5. INSTANCIE O HOOK DE UPLOAD
  const { isUploading, progress, uploadImageFile } = useProgramImageUpload(
    (publicUrl) => {
      // Upload deu certo!
      if (formDataRef.current) {
        handleSave(formDataRef.current, publicUrl);
      } else {
        toast({
          title: "Erro",
          description: "Dados do formulário não encontrados.",
          variant: "destructive",
        });
      }
    },
    (error) => {
      // Upload falhou
      setUploadError(error);
      form.setError("image_file", { type: "manual", message: error });
      setIsSubmitting(false); // Garante que o botão seja reabilitado
    }
  );

  // 6. SUBSTITUA A FUNÇÃO onSubmit
  async function onSubmit(values: ProgramFormData) {
    setIsSubmitting(true);
    setUploadError(null);
    formDataRef.current = values; // Salva dados (título, etc.) no ref

    const file = values.image_file?.[0]; // O Zod passa um FileList

    if (file) {
      // 1. TEM ARQUIVO NOVO: Inicia o upload.
      // O `onSuccess` do hook (que configuramos acima) vai chamar o `handleSave`.
      uploadImageFile(file);
    } else {
      // 2. SEM ARQUIVO NOVO: Salva direto.
      // A URL é a que já existia OU nula se o usuário removeu.
      const finalImageUrl = isRemovingImage ? null : program?.image_url || null;
      handleSave(values, finalImageUrl);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Campos existentes */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Café com o Programador" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva sobre o que é este programa..."
                  className="resize-none"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 7. NOVO CAMPO DE IMAGEM NO JSX */}
        <FormField
          control={form.control}
          name="image_file"
          render={({ field: { onChange, value, ...fieldProps } }) => (
            <FormItem>
              <FormLabel>Capa do Programa</FormLabel>
              <FormControl>
                <div className="flex flex-col gap-2">
                  <div
                    className="relative w-full h-48 border-2 border-dashed border-muted-foreground/25 rounded-md overflow-hidden bg-muted/30 cursor-pointer group"
                    onClick={() =>
                      document.getElementById("image-upload-input")?.click()
                    }
                  >
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center">
                        <div className="w-3/4 space-y-2">
                          <Progress value={progress} className="w-full" />
                          <p className="text-white text-xs text-center">
                            Enviando... {progress}%
                          </p>
                        </div>
                      </div>
                    )}
                    {imagePreview ? (
                      <>
                        <Image
                          src={imagePreview}
                          alt="Preview da capa do programa"
                          fill
                          className="object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            setImagePreview(null);
                            setIsRemovingImage(true);
                            onChange(null);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <ImageIcon className="h-10 w-10 mb-2" />
                        <p className="text-sm">
                          Clique para adicionar uma imagem
                        </p>
                        <p className="text-xs">PNG, JPG, GIF (Máx. 5MB)</p>
                      </div>
                    )}
                  </div>
                  <Input
                    {...fieldProps}
                    id="image-upload-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        onChange(e.target.files);
                        setImagePreview(URL.createObjectURL(file));
                        setIsRemovingImage(false);
                        setUploadError(null);
                      }
                    }}
                  />
                </div>
              </FormControl>
              <FormMessage />
              {uploadError && (
                <p className="text-sm font-medium text-destructive">
                  {uploadError}
                </p>
              )}
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting || isUploading}>
            {isSubmitting || isUploading
              ? "Salvando..."
              : program
              ? "Salvar Alterações"
              : "Criar Programa"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
