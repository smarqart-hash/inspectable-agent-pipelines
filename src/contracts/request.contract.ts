import { z } from 'zod';

export const ProductRequestInputSchema = z
  .object({
    request: z.string().min(10),
  })
  .strict();

export type ProductRequestInput = z.infer<typeof ProductRequestInputSchema>;
