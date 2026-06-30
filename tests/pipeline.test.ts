import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, test } from 'vitest';
import { runInspectablePipeline } from '../src/runtime/orchestrator.js';

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe('pipeline', () => {
  test('creates an inspectable run packet', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'inspectable-pipeline-'));
    tempDirs.push(dir);

    const summary = await runInspectablePipeline({
      request: 'Build a browser extension that summarizes long procurement notices for small suppliers.',
      outputDir: dir,
      runId: 'test-run',
    });

    expect(summary.verdict).toBe('pass_with_findings');
    expect(summary.findings).toBe(1);
    expect(summary.files.map((file) => file.split(/[\\/]/).pop())).toEqual(
      expect.arrayContaining([
        'input.md',
        '01-intake.json',
        '02-risk.json',
        '03-plan.json',
        '04-review.json',
        '05-decision.json',
        'decision-log.md',
        'final-brief.md',
        'summary.json',
      ]),
    );

    const finalBrief = await readFile(join(dir, 'final-brief.md'), 'utf8');
    expect(finalBrief).toContain('Dropped During Review');
    expect(finalBrief).not.toContain('reduce review time by 60 percent');
  });
});
