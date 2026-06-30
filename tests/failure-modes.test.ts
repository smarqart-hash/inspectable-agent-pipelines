import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, test } from 'vitest';
import { runInspectablePipeline } from '../src/runtime/orchestrator.js';
import { SchemaValidationError } from '../src/runtime/validate.js';

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe('failure modes', () => {
  test('schema failures stop the pipeline and write a failure event', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'inspectable-pipeline-fail-'));
    tempDirs.push(dir);

    await expect(
      runInspectablePipeline({
        request: 'Build a browser extension that summarizes long procurement notices for small suppliers.',
        outputDir: dir,
        runId: 'failure-run',
        overrides: {
          intake: { generated_at: 'not-a-date' },
        },
      }),
    ).rejects.toBeInstanceOf(SchemaValidationError);

    const log = await readFile(join(dir, 'run.jsonl'), 'utf8');
    expect(log).toContain('"event":"step.failed"');
    expect(log).toContain('"event":"run.failed"');
  });

  test('review gate catches unsupported plan claims', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'inspectable-pipeline-review-'));
    tempDirs.push(dir);

    await runInspectablePipeline({
      request: 'Build a browser extension that summarizes long procurement notices for small suppliers.',
      outputDir: dir,
      runId: 'review-run',
    });

    const review = JSON.parse(await readFile(join(dir, '04-review.json'), 'utf8')) as {
      findings: Array<{ claim_id: string; severity: string }>;
    };

    expect(review.findings).toEqual([
      expect.objectContaining({
        claim_id: 'C-003',
        severity: 'high',
      }),
    ]);
  });
});
