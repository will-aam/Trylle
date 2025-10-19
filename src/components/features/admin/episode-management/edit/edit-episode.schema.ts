// src/components/features/admin/episode-management/edit/edit-episode.schema.ts
import { z } from "zod";

export const updateEpisodeSchema = z
  .object({
    title: z.string().min(1, "O título é obrigatório."),
    description: z.string().optional().nullable(),
    program_id: z.string().optional().nullable(),
    episode_number: z
      .preprocess(
        (val) => (val === "" || val === null ? undefined : Number(val)),
        z
          .number()
          .int("Deve ser um número inteiro.")
          .positive("Deve ser um número positivo.")
          .optional()
      )
      .optional(),
    category_id: z.string().min(1, "A categoria é obrigatória."),
    subcategory_id: z.string().optional().nullable(),
    tags: z.array(z.string()).optional().default([]),
  })
  .strict();

export type UpdateEpisodeInput = z.infer<typeof updateEpisodeSchema>;
