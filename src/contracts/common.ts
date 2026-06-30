import { z } from 'zod';

export const IsoDateTimeSchema = z.string().datetime();

export const EvidenceRefSchema = z
  .object({
    id: z.string().min(1),
    label: z.string().min(1),
  })
  .strict();

export const SeveritySchema = z.enum(['low', 'medium', 'high']);
export const ReviewStatusSchema = z.enum(['open', 'resolved']);
export const DecisionKindSchema = z.enum(['keep', 'revise', 'drop']);

export type EvidenceRef = z.infer<typeof EvidenceRefSchema>;
export type Severity = z.infer<typeof SeveritySchema>;
export type DecisionKind = z.infer<typeof DecisionKindSchema>;
