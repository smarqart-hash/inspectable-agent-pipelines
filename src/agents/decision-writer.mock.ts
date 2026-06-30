import type { PlanOutput } from '../contracts/plan.contract.js';
import type { ReviewOutput } from '../contracts/review.contract.js';
import {
  DECISION_SCHEMA_VERSION,
  DECISION_WRITER,
  type DecisionOutput,
} from '../contracts/decision.contract.js';
import { applyOverrides, FIXED_GENERATED_AT } from './mock-utils.js';

export async function decisionWriterMock(
  input: { plan: PlanOutput; review: ReviewOutput },
  overrides?: Partial<DecisionOutput>,
): Promise<DecisionOutput> {
  const droppedClaimIds = new Set(input.review.findings.map((finding) => finding.claim_id));
  const keptClaims = input.plan.claims.filter((claim) => !droppedClaimIds.has(claim.id));
  const decisions = input.review.findings.map((finding, index) => ({
    id: `D-${String(index + 1).padStart(3, '0')}`,
    finding_id: finding.id,
    decision: 'drop' as const,
    reason: `Dropped ${finding.claim_id} because the review gate found no upstream support.`,
  }));

  const output: DecisionOutput = {
    $schema_version: DECISION_SCHEMA_VERSION,
    agent: DECISION_WRITER,
    generated_at: FIXED_GENERATED_AT,
    decisions,
    final_brief_markdown: [
      '# Implementation Brief',
      '',
      `## ${input.plan.implementation_brief.title}`,
      '',
      `Target user: ${input.plan.implementation_brief.target_user}.`,
      '',
      '### Scope',
      ...input.plan.implementation_brief.scope.map((item) => `- ${item}`),
      '',
      '### First Steps',
      ...input.plan.implementation_brief.steps.map((item, index) => `${index + 1}. ${item}`),
      '',
      '### Kept Claims',
      ...keptClaims.map((claim) => `- ${claim.id}: ${claim.text}`),
      '',
      '### Dropped During Review',
      ...(input.review.findings.length === 0
        ? ['- None.']
        : input.review.findings.map((finding) => `- ${finding.claim_id}: ${finding.required_action}`)),
    ].join('\n'),
  };

  return applyOverrides(output, overrides);
}
