export type PipelineClock = {
  nowIso: () => string;
  nowMs: () => number;
};

export const systemClock: PipelineClock = {
  nowIso: () => new Date().toISOString(),
  nowMs: () => Date.now(),
};

export function createDeterministicClock(startIso: string, stepMs = 10): PipelineClock {
  let currentMs = Date.parse(startIso);

  function tick(): number {
    currentMs += stepMs;
    return currentMs;
  }

  return {
    nowIso: () => new Date(tick()).toISOString(),
    nowMs: () => tick(),
  };
}
