import { runInspectablePipeline } from './runtime/orchestrator.js';

const DEFAULT_REQUEST =
  'Build a browser extension that summarizes long procurement notices for small suppliers.';

const summary = await runInspectablePipeline({
  request: process.argv.slice(2).join(' ') || DEFAULT_REQUEST,
  outputDir: 'examples/runs/sample-run',
  runId: 'sample-run',
});

console.log(`Inspectable pipeline completed: ${summary.verdict}`);
console.log(`Run packet: ${summary.output_dir}`);
console.log(`Review findings: ${summary.findings}`);
