import { z } from 'zod';
import { IsoDateTimeSchema } from './common.js';

export const PLAN_AGENT = 'plan-agent';
export const PLAN_SCHEMA_VERSION = '1.0.0';

export const PlanOutputSchema = z
  .object({
    $schema_version: z.literal(PLAN_SCHEMA_VERSION),
    agent: z.literal(PLAN_AGENT),
    generated_at: IsoDateTimeSchema,
    implementation_brief: z
      .object({
        title: z.string().min(1),
        target_user: z.string().min(1),
        scope: z.array(z.string().min(1)).min(1),
        out_of_scope: z.array(z.string().min(1)),
        steps: z.array(z.string().min(1)).min(1),
      })
      .strict(),
    claims: z.array(
      z
        .object({
          id: z.string().min(1),
          text: z.string().min(1),
          supported_by: z.array(z.string().min(1)),
        })
        .strict(),
    ),
    open_questions: z.array(z.string().min(1)),
  })
  .strict();

export type PlanOutput = z.infer<typeof PlanOutputSchema>;
