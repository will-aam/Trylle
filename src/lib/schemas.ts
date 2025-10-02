import { z } from "zod";

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
