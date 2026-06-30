import { describe, expect, test } from 'vitest';
import { decisionWriterMock } from '../src/agents/decision-writer.mock.js';
import { intakeMock } from '../src/agents/intake.mock.js';
import { planMock } from '../src/agents/plan.mock.js';
import { reviewGateMock } from '../src/agents/review-gate.mock.js';
import { riskMock } from '../src/agents/risk.mock.js';
import { DecisionOutputSchema } from '../src/contracts/decision.contract.js';
import { IntakeOutputSchema } from '../src/contracts/intake.contract.js';
import { PlanOutputSchema } from '../src/contracts/plan.contract.js';
import { RiskOutputSchema } from '../src/contracts/risk.contract.js';
import { ReviewOutputSchema } from '../src/contracts/review.contract.js';

describe('schemas', () => {
  test('all default mock outputs validate against their contracts', async () => {
    const input = {
      request: 'Build a browser extension that summarizes long procurement notices for small suppliers.',
    };
    const intake = await intakeMock(input);
    const risk = await riskMock({ intake });
    const plan = await planMock({ intake, risk });
    const review = await reviewGateMock({ plan });
    const decision = await decisionWriterMock({ plan, review });

    expect(IntakeOutputSchema.safeParse(intake).success).toBe(true);
    expect(RiskOutputSchema.safeParse(risk).success).toBe(true);
    expect(PlanOutputSchema.safeParse(plan).success).toBe(true);
    expect(ReviewOutputSchema.safeParse(review).success).toBe(true);
    expect(DecisionOutputSchema.safeParse(decision).success).toBe(true);
  });

  test('strict contracts reject extra fields', async () => {
    const intake = await intakeMock({
      request: 'Build a browser extension that summarizes long procurement notices for small suppliers.',
    });

    const parsed = IntakeOutputSchema.safeParse({ ...intake, extra: true });

    expect(parsed.success).toBe(false);
  });
});
