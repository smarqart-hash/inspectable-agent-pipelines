import { appendFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

export type RunLogEvent = {
  ts: string;
  run_id: string;
  event: string;
  step?: string;
  status?: 'started' | 'ok' | 'failed';
  duration_ms?: number;
  detail?: Record<string, unknown>;
};

export class RunLogger {
  constructor(
    private readonly runId: string,
    private readonly filePath: string,
    private readonly nowIso: () => string = () => new Date().toISOString(),
  ) {}

  async event(event: Omit<RunLogEvent, 'ts' | 'run_id'>): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true });
    const row: RunLogEvent = {
      ts: this.nowIso(),
      run_id: this.runId,
      ...event,
    };
    await appendFile(this.filePath, `${JSON.stringify(row)}\n`, 'utf8');
  }
}
