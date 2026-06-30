import { z } from 'zod';
import { EvidenceRefSchema, IsoDateTimeSchema, SeveritySchema } from './common.js';

export const RISK_AGENT = 'risk-agent';
export const RISK_SCHEMA_VERSION = '1.0.0';

export const RiskOutputSchema = z
  .object({
    $schema_version: z.literal(RISK_SCHEMA_VERSION),
    agent: z.literal(RISK_AGENT),
    generated_at: IsoDateTimeSchema,
    verdict: z.enum(['pass', 'needs_review']),
    risks: z.array(
      z
        .object({
          id: z.string().min(1),
          severity: SeveritySchema,
          risk: z.string().min(1),
          evidence_refs: z.array(EvidenceRefSchema),
          mitigation: z.string().min(1),
        })
        .strict(),
    ),
    unsupported_assumptions: z.array(
      z
        .object({
          id: z.string().min(1),
          assumption: z.string().min(1),
          reason: z.string().min(1),
        })
        .strict(),
    ),
  })
  .strict();

export type RiskOutput = z.infer<typeof RiskOutputSchema>;
