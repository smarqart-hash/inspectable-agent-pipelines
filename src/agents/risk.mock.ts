import type { IntakeOutput } from '../contracts/intake.contract.js';
import { RISK_AGENT, RISK_SCHEMA_VERSION, type RiskOutput } from '../contracts/risk.contract.js';
import { applyOverrides, FIXED_GENERATED_AT } from './mock-utils.js';

export async function riskMock(
  input: { intake: IntakeOutput },
  overrides?: Partial<RiskOutput>,
): Promise<RiskOutput> {
  const output: RiskOutput = {
    $schema_version: RISK_SCHEMA_VERSION,
    agent: RISK_AGENT,
    generated_at: FIXED_GENERATED_AT,
    verdict: 'needs_review',
    risks: [
      {
        id: 'RISK-001',
        severity: 'medium',
        risk: 'The request implies source-grounded summaries, but no source-retention requirement is specified.',
        evidence_refs: input.intake.evidence_refs,
        mitigation: 'Keep source links attached to each summary sentence or section.',
      },
      {
        id: 'RISK-002',
        severity: 'medium',
        risk: 'The target portals and languages are unspecified.',
        evidence_refs: [{ id: 'REQ-001', label: input.intake.request_summary.goal }],
        mitigation: 'Limit the MVP to one portal format and one language until fixtures exist.',
      },
    ],
    unsupported_assumptions: [
      {
        id: 'ASSUMP-001',
        assumption: 'The extension will measurably reduce review time.',
        reason: 'No baseline, user study or benchmark is available in the request.',
      },
    ],
  };

  return applyOverrides(output, overrides);
}
