# Review Gates

This project uses review gates comparable to the research workflow, but tuned for code and agent engineering.

## 1. Skeptical Agent Engineer

Checks:

- Are outputs validated by contracts?
- Can malformed output fail loudly?
- Can a run be inspected without reading a transcript?
- Are tests meaningful, or are they just snapshots?

Artifact:

- [skeptical-agent-engineer.md](reviews/skeptical-agent-engineer.md)

## 2. Platform / Ops Reviewer

Checks:

- Does every run produce a JSONL log?
- Can partial failure be diagnosed?
- Are live calls disabled by default?
- Would cost and duration have a place to go later?

Artifact:

- [platform-ops-review.md](reviews/platform-ops-review.md)

## 3. Non-AI Product Reader

Checks:

- Can a non-AI stakeholder understand what happened?
- Does the README explain the practical value?
- Is the demo useful without knowing Zod or Vitest?

Artifact:

- [non-ai-reader-review.md](reviews/non-ai-reader-review.md)

## 4. Senior-Engineer / Hiring Review

Checks:

- Is the scope small and finished?
- Is the code idiomatic TypeScript?
- Are the tests aligned with the claim?
- Does the repo show judgment rather than framework worship?

Artifact:

- [senior-engineer-review.md](reviews/senior-engineer-review.md)
