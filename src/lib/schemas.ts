// src/lib/schemas.ts
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

// Criamos também um tipo inferido a partir do schema para usar no nosso formulário
export type CategoryFormData = z.infer<typeof categoryFormSchema>;
