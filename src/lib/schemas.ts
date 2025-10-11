import { z } from "zod";

const updateEpisodeSchema = z.object({
  title: z.string().min(1, "O título é obrigatório."),
  description: z.string().optional(),
  program_id: z.string().optional().nullable(),
  episode_number: z.coerce
    .number()
    .positive("O número do episódio deve ser positivo.")
    .optional()
    .nullable(),
  category_id: z.string().min(1, "A categoria é obrigatória."),
  subcategory_id: z.string().optional().nullable(),
  tags: z.array(z.any()).optional(), // Usamos z.any() para tags pois o objeto pode variar
  page_count: z.coerce.number().optional().nullable(), // z.coerce para converter string para número
  reference_count: z.coerce.number().optional().nullable(), // z.coerce para converter string para número
});

export const categoryFormSchema = z.object({
  name: z
    .string()
    .min(3, {
      message: "O nome da categoria precisa ter pelo menos 3 caracteres.",
    })
    .max(50, {
      message: "O nome da categoria não pode ter mais de 50 caracteres.",
    }),
  // Campo do tema (classe CSS) que será aplicado visualmente nos cards.
  // Mantemos como string | null para suportar ausência de tema.
  color_theme: z.string().nullable(),
});
export type CategoryFormData = z.infer<typeof categoryFormSchema>;

export const programSchema = z.object({
  title: z
    .string()
    .min(3, { message: "O título precisa ter pelo menos 3 caracteres." }),
  description: z
    .string()
    .min(10, { message: "A descrição precisa ter pelo menos 10 caracteres." }),
  category_id: z.string().nonempty({ message: "Selecione uma categoria." }),
});
export type ProgramFormData = z.infer<typeof programSchema>;

export const episodeSchema = z.object({
  title: z.string().min(1, "O título é obrigatório."),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  category_id: z.string().min(1, "A categoria é obrigatória."),
  subcategory_id: z.string().optional().nullable(),
  audio_file: z
    .any()
    .refine((file) => !!file, "O arquivo de áudio é obrigatório.")
    .refine(
      (file) => file?.size <= 50000000,
      `O arquivo de áudio precisa ter no máximo 50MB.`
    )
    .refine(
      (file) => file?.type.startsWith("audio/"),
      "Apenas arquivos de áudio são permitidos."
    ),
  document_file: z
    .any()
    .refine(
      (file) => file?.size <= 10000000,
      `O documento precisa ter no máximo 10MB.`
    )
    .optional()
    .nullable(),
  // ADICIONANDO OS CAMPOS QUE FALTAVAM
  page_count: z.coerce.number().optional().nullable(),
  reference_count: z.coerce.number().optional().nullable(),
});
