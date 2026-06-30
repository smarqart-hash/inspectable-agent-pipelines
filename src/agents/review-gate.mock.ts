import type { PlanOutput } from '../contracts/plan.contract.js';
import {
  REVIEW_GATE,
  REVIEW_SCHEMA_VERSION,
  type ReviewOutput,
} from '../contracts/review.contract.js';
import { applyOverrides, FIXED_GENERATED_AT } from './mock-utils.js';

export async function reviewGateMock(
  input: { plan: PlanOutput },
  overrides?: Partial<ReviewOutput>,
): Promise<ReviewOutput> {
  const findings = input.plan.claims
    .filter((claim) => claim.supported_by.length === 0)
    .map((claim, index) => ({
      id: `F-${String(index + 1).padStart(3, '0')}`,
      severity: 'high' as const,
      claim_id: claim.id,
      finding: `Claim "${claim.text}" has no upstream support.`,
      required_action: 'Drop the claim or add a checked evidence reference.',
      status: 'resolved' as const,
    }));

  const output: ReviewOutput = {
    $schema_version: REVIEW_SCHEMA_VERSION,
    gate: REVIEW_GATE,
    generated_at: FIXED_GENERATED_AT,
    verdict: findings.length > 0 ? 'pass_with_findings' : 'pass',
    findings,
  };

  return applyOverrides(output, overrides);
}
