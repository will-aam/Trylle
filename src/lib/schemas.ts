import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

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
