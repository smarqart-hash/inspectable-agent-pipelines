import { z } from 'zod';
import { DecisionKindSchema, IsoDateTimeSchema } from './common.js';

export const DECISION_WRITER = 'decision-writer';
export const DECISION_SCHEMA_VERSION = '1.0.0';

export const DecisionOutputSchema = z
  .object({
    $schema_version: z.literal(DECISION_SCHEMA_VERSION),
    agent: z.literal(DECISION_WRITER),
    generated_at: IsoDateTimeSchema,
    decisions: z.array(
      z
        .object({
          id: z.string().min(1),
          finding_id: z.string().min(1),
          decision: DecisionKindSchema,
          reason: z.string().min(1),
        })
        .strict(),
    ),
    final_brief_markdown: z.string().min(1),
  })
  .strict();

export type DecisionOutput = z.infer<typeof DecisionOutputSchema>;
