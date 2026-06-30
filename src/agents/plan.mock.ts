import type { IntakeOutput } from '../contracts/intake.contract.js';
import type { RiskOutput } from '../contracts/risk.contract.js';
import { PLAN_AGENT, PLAN_SCHEMA_VERSION, type PlanOutput } from '../contracts/plan.contract.js';
import { applyOverrides, FIXED_GENERATED_AT } from './mock-utils.js';

export async function planMock(
  input: { intake: IntakeOutput; risk: RiskOutput },
  overrides?: Partial<PlanOutput>,
): Promise<PlanOutput> {
  const output: PlanOutput = {
    $schema_version: PLAN_SCHEMA_VERSION,
    agent: PLAN_AGENT,
    generated_at: FIXED_GENERATED_AT,
    implementation_brief: {
      title: 'Procurement notice summarizer extension',
      target_user: input.intake.request_summary.users[0] ?? 'small suppliers',
      scope: [
        'Parse one supported procurement notice page format.',
        'Produce a short summary with retained source links.',
        'Show uncertainty when required fields are missing.',
      ],
      out_of_scope: [
        'Automated bid/no-bid recommendations.',
        'Multi-portal crawling.',
        'Legal compliance scoring.',
      ],
      steps: [
        'Create fixtures from public procurement notices.',
        'Define extraction and summary output contracts.',
        'Build a browser-side parser for the first supported page format.',
        'Render a source-linked summary panel.',
        'Add regression tests for malformed notices.',
      ],
    },
    claims: [
      {
        id: 'C-001',
        text: 'The target users are small suppliers.',
        supported_by: ['REQ-USER-001'],
      },
      {
        id: 'C-002',
        text: 'The MVP should preserve source links in summaries.',
        supported_by: ['RISK-001'],
      },
      {
        id: 'C-003',
        text: 'The extension will reduce review time by 60 percent.',
        supported_by: [],
      },
    ],
    open_questions: input.intake.request_summary.unknowns,
  };

  return applyOverrides(output, overrides);
}
