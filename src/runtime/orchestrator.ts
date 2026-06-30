import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { decisionWriterMock } from '../agents/decision-writer.mock.js';
import { intakeMock } from '../agents/intake.mock.js';
import { planMock } from '../agents/plan.mock.js';
import { reviewGateMock } from '../agents/review-gate.mock.js';
import { riskMock } from '../agents/risk.mock.js';
import type { DecisionOutput } from '../contracts/decision.contract.js';
import { DecisionOutputSchema } from '../contracts/decision.contract.js';
import type { IntakeOutput } from '../contracts/intake.contract.js';
import { IntakeOutputSchema } from '../contracts/intake.contract.js';
import type { PlanOutput } from '../contracts/plan.contract.js';
import { PlanOutputSchema } from '../contracts/plan.contract.js';
import { ProductRequestInputSchema } from '../contracts/request.contract.js';
import type { ReviewOutput } from '../contracts/review.contract.js';
import { ReviewOutputSchema } from '../contracts/review.contract.js';
import type { RiskOutput } from '../contracts/risk.contract.js';
import { RiskOutputSchema } from '../contracts/risk.contract.js';
import { createRunId } from './ids.js';
import { RunLogger } from './run-log.js';
import { validateOrThrow } from './validate.js';

export type PipelineOverrides = {
  intake?: Partial<IntakeOutput>;
  risk?: Partial<RiskOutput>;
  plan?: Partial<PlanOutput>;
  review?: Partial<ReviewOutput>;
  decision?: Partial<DecisionOutput>;
};

export type PipelineOptions = {
  request: string;
  outputDir?: string;
  runId?: string;
  overrides?: PipelineOverrides;
};

export type PipelineSummary = {
  run_id: string;
  output_dir: string;
  verdict: ReviewOutput['verdict'];
  files: string[];
  findings: number;
};

export async function runInspectablePipeline(options: PipelineOptions): Promise<PipelineSummary> {
  const input = validateOrThrow(ProductRequestInputSchema, { request: options.request }, 'request');
  const runId = options.runId ?? createRunId(input.request);
  const outputDir = options.outputDir ?? join('examples', 'runs', runId);
  const logPath = join(outputDir, 'run.jsonl');
  const logger = new RunLogger(runId, logPath);
  const files: string[] = [];

  await mkdir(outputDir, { recursive: true });
  await writeFile(logPath, '', 'utf8');
  files.push(logPath);
  await writeText(join(outputDir, 'input.md'), input.request, files);
  await logger.event({ event: 'run.started', status: 'started', detail: { output_dir: outputDir } });

  try {
    const intake = await timedStep(logger, 'intake', async () =>
      validateOrThrow(
        IntakeOutputSchema,
        await intakeMock(input, options.overrides?.intake),
        'intake-agent',
      ),
    );
    await writeJson(join(outputDir, '01-intake.json'), intake, files);

    const risk = await timedStep(logger, 'risk', async () =>
      validateOrThrow(RiskOutputSchema, await riskMock({ intake }, options.overrides?.risk), 'risk-agent'),
    );
    await writeJson(join(outputDir, '02-risk.json'), risk, files);

    const plan = await timedStep(logger, 'plan', async () =>
      validateOrThrow(
        PlanOutputSchema,
        await planMock({ intake, risk }, options.overrides?.plan),
        'plan-agent',
      ),
    );
    await writeJson(join(outputDir, '03-plan.json'), plan, files);

    const review = await timedStep(logger, 'review', async () =>
      validateOrThrow(
        ReviewOutputSchema,
        await reviewGateMock({ plan }, options.overrides?.review),
        'review-gate',
      ),
    );
    await writeJson(join(outputDir, '04-review.json'), review, files);

    const decision = await timedStep(logger, 'decision', async () =>
      validateOrThrow(
        DecisionOutputSchema,
        await decisionWriterMock({ plan, review }, options.overrides?.decision),
        'decision-writer',
      ),
    );
    await writeJson(join(outputDir, '05-decision.json'), decision, files);
    await writeText(join(outputDir, 'decision-log.md'), renderDecisionLog(decision), files);
    await writeText(join(outputDir, 'final-brief.md'), decision.final_brief_markdown, files);

    const summaryPath = join(outputDir, 'summary.json');
    const summary: PipelineSummary = {
      run_id: runId,
      output_dir: outputDir,
      verdict: review.verdict,
      files: [...files, summaryPath],
      findings: review.findings.length,
    };
    await writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
    files.push(summaryPath);
    await logger.event({ event: 'run.completed', status: 'ok', detail: summary });
    return summary;
  } catch (error) {
    await logger.event({
      event: 'run.failed',
      status: 'failed',
      detail: { message: error instanceof Error ? error.message : String(error) },
    });
    throw error;
  }
}

async function timedStep<T>(logger: RunLogger, step: string, fn: () => Promise<T>): Promise<T> {
  const started = Date.now();
  await logger.event({ event: 'step.started', step, status: 'started' });
  try {
    const result = await fn();
    await logger.event({
      event: 'step.completed',
      step,
      status: 'ok',
      duration_ms: Date.now() - started,
    });
    return result;
  } catch (error) {
    await logger.event({
      event: 'step.failed',
      step,
      status: 'failed',
      duration_ms: Date.now() - started,
      detail: { message: error instanceof Error ? error.message : String(error) },
    });
    throw error;
  }
}

async function writeJson(path: string, value: unknown, files: string[]): Promise<void> {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  files.push(path);
}

async function writeText(path: string, value: string, files: string[]): Promise<void> {
  await writeFile(path, `${value.trimEnd()}\n`, 'utf8');
  files.push(path);
}

function renderDecisionLog(decision: DecisionOutput): string {
  const rows = decision.decisions.map(
    (entry) => `| ${entry.id} | ${entry.finding_id} | ${entry.decision} | ${entry.reason} |`,
  );
  return [
    '# Decision Log',
    '',
    '| ID | Finding | Decision | Reason |',
    '|---|---|---|---|',
    ...rows,
    rows.length === 0 ? '| D-000 | none | keep | No review findings were raised. |' : '',
  ]
    .filter(Boolean)
    .join('\n');
}
