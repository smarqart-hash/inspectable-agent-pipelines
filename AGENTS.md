# Inspectable Agent Pipelines

## Tech Stack

- Node.js + npm
- TypeScript ESM
- Zod for runtime contracts
- Vitest for eval-style tests
- `tsx` for the demo CLI

## Commands

- Install: `npm install`
- Demo: `npm run demo`
- Tests: `npm test`
- Typecheck: `npm run typecheck`
- Full local gate: `npm run verify`

## Architecture

- `src/contracts/`: Zod schemas and inferred TypeScript types.
- `src/agents/`: deterministic mock agents; no live model calls by default.
- `src/runtime/`: orchestration, validation, IDs and JSONL run logging.
- `src/cli.ts`: default demo entry point.
- `tests/`: pipeline, schema and failure-mode tests.
- `examples/runs/`: inspectable run packets produced by the demo.

## Development

- Use `/spec` or an equivalent short written plan before broad feature work.
- Add or update contracts before changing agent outputs.
- Keep default runs offline and deterministic.
- Failure-mode tests are required for schema or orchestration changes.
- Do not add live LLM calls to the default `npm run demo` path.

## Environments

- No environment variables are required for the default demo.
- Optional live adapters may use `.env.local`; keep `.env*` ignored except `.env.example`.

## Current Priorities

- Keep the repo small enough to inspect in one sitting.
- Show contracts, evals and run logs as the core value.
- Preserve public-safe examples only.
