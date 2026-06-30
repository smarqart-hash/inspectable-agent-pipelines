import { z } from 'zod';
import { IsoDateTimeSchema, ReviewStatusSchema, SeveritySchema } from './common.js';

export const REVIEW_GATE = 'review-gate';
export const REVIEW_SCHEMA_VERSION = '1.0.0';

export const ReviewOutputSchema = z
  .object({
    $schema_version: z.literal(REVIEW_SCHEMA_VERSION),
    gate: z.literal(REVIEW_GATE),
    generated_at: IsoDateTimeSchema,
    verdict: z.enum(['pass', 'pass_with_findings', 'fail']),
    findings: z.array(
      z
        .object({
          id: z.string().min(1),
          severity: SeveritySchema,
          claim_id: z.string().min(1),
          finding: z.string().min(1),
          required_action: z.string().min(1),
          status: ReviewStatusSchema,
        })
        .strict(),
    ),
  })
  .strict();

export type ReviewOutput = z.infer<typeof ReviewOutputSchema>;
