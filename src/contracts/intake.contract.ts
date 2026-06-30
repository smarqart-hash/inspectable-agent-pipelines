import { z } from 'zod';
import { EvidenceRefSchema, IsoDateTimeSchema } from './common.js';

export const INTAKE_AGENT = 'intake-agent';
export const INTAKE_SCHEMA_VERSION = '1.0.0';

export const IntakeOutputSchema = z
  .object({
    $schema_version: z.literal(INTAKE_SCHEMA_VERSION),
    agent: z.literal(INTAKE_AGENT),
    generated_at: IsoDateTimeSchema,
    request_summary: z
      .object({
        goal: z.string().min(1),
        users: z.array(z.string().min(1)).min(1),
        constraints: z.array(z.string().min(1)),
        unknowns: z.array(z.string().min(1)),
      })
      .strict(),
    evidence_refs: z.array(EvidenceRefSchema).min(1),
  })
  .strict();

export type IntakeOutput = z.infer<typeof IntakeOutputSchema>;
