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
import type { PipelineClock } from './clock.js';
import { systemClock } from './clock.js';
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
  clock?: PipelineClock;
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
  // Serialized paths use posix separators so a committed run packet reads the same
  // on every platform. Node fs accepts forward slashes on Windows.
  const outputDir = toPosix(options.outputDir ?? join('examples', 'runs', runId));
  const logPath = `${outputDir}/run.jsonl`;
  const clock = options.clock ?? systemClock;
  const logger = new RunLogger(runId, logPath, clock.nowIso);
  const files: string[] = [];

  await mkdir(outputDir, { recursive: true });
  await writeFile(logPath, '', 'utf8');
  files.push(logPath);
  await writeText(`${outputDir}/input.md`, input.request, files);
  await logger.event({ event: 'run.started', status: 'started', detail: { output_dir: outputDir } });

  try {
    const intake = await timedStep(logger, clock, 'intake', async () =>
      validateOrThrow(
        IntakeOutputSchema,
        await intakeMock(input, options.overrides?.intake),
        'intake-agent',
      ),
    );
    await writeJson(`${outputDir}/01-intake.json`, intake, files);

    const risk = await timedStep(logger, clock, 'risk', async () =>
      validateOrThrow(RiskOutputSchema, await riskMock({ intake }, options.overrides?.risk), 'risk-agent'),
    );
    await writeJson(`${outputDir}/02-risk.json`, risk, files);

    const plan = await timedStep(logger, clock, 'plan', async () =>
      validateOrThrow(
        PlanOutputSchema,
        await planMock({ intake, risk }, options.overrides?.plan),
        'plan-agent',
      ),
    );
    await writeJson(`${outputDir}/03-plan.json`, plan, files);

    const review = await timedStep(logger, clock, 'review', async () =>
      validateOrThrow(
        ReviewOutputSchema,
        await reviewGateMock({ plan }, options.overrides?.review),
        'review-gate',
      ),
    );
    await writeJson(`${outputDir}/04-review.json`, review, files);

    const decision = await timedStep(logger, clock, 'decision', async () =>
      validateOrThrow(
        DecisionOutputSchema,
        await decisionWriterMock({ plan, review }, options.overrides?.decision),
        'decision-writer',
      ),
    );
    await writeJson(`${outputDir}/05-decision.json`, decision, files);
    await writeText(`${outputDir}/decision-log.md`, renderDecisionLog(decision), files);
    await writeText(`${outputDir}/final-brief.md`, decision.final_brief_markdown, files);

    const summaryPath = `${outputDir}/summary.json`;
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

async function timedStep<T>(
  logger: RunLogger,
  clock: PipelineClock,
  step: string,
  fn: () => Promise<T>,
): Promise<T> {
  const started = clock.nowMs();
  await logger.event({ event: 'step.started', step, status: 'started' });
  try {
    const result = await fn();
    await logger.event({
      event: 'step.completed',
      step,
      status: 'ok',
      duration_ms: clock.nowMs() - started,
    });
    return result;
  } catch (error) {
    await logger.event({
      event: 'step.failed',
      step,
      status: 'failed',
      duration_ms: clock.nowMs() - started,
      detail: { message: error instanceof Error ? error.message : String(error) },
    });
    throw error;
  }
}

function toPosix(value: string): string {
  return value.replace(/\\/g, '/');
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
