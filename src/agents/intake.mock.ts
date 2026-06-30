import type { ProductRequestInput } from '../contracts/request.contract.js';
import {
  INTAKE_AGENT,
  INTAKE_SCHEMA_VERSION,
  type IntakeOutput,
} from '../contracts/intake.contract.js';
import { applyOverrides, FIXED_GENERATED_AT } from './mock-utils.js';

export async function intakeMock(
  input: ProductRequestInput,
  overrides?: Partial<IntakeOutput>,
): Promise<IntakeOutput> {
  const output: IntakeOutput = {
    $schema_version: INTAKE_SCHEMA_VERSION,
    agent: INTAKE_AGENT,
    generated_at: FIXED_GENERATED_AT,
    request_summary: {
      goal: 'Build a browser extension that summarizes long procurement notices.',
      users: ['small suppliers'],
      constraints: ['browser extension', 'procurement notices', 'summaries must preserve source links'],
      unknowns: ['which procurement portals are in scope', 'summary length', 'supported languages'],
    },
    evidence_refs: [
      {
        id: 'REQ-001',
        label: input.request,
      },
      {
        id: 'REQ-USER-001',
        label: 'small suppliers',
      },
    ],
  };

  return applyOverrides(output, overrides);
}
