# Method Roots and Inspirations

This repository is small on purpose. It combines a few established software-engineering ideas and applies them to agent pipelines.

## Walking skeleton

The demo follows the walking-skeleton idea: build a thin end-to-end path first, then add complexity. Here, the path is request -> intake -> risk -> plan -> review -> decision -> run packet.

The mock agents are not meant to prove model quality. They prove that contracts, logs, tests and review artifacts are wired before live model calls are added.

Reference: [Walking Skeleton, 97 Things Every Software Architect Should Know](https://www.oreilly.com/library/view/97-things-every/9780596800611/ch60.html)

## Simple agent workflows before agent sprawl

The repo favors explicit workflow steps over a large autonomous system. That matches the practical guidance that many useful agentic systems are workflows with clear control flow, not open-ended multi-agent clouds.

Reference: [Anthropic, Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)

## Contracts at the handoff

Each step produces a structured object that the next step can rely on. This borrows from contract thinking in distributed software: downstream consumers should not have to guess what an upstream producer meant.

References:

- [Martin Fowler, Consumer-Driven Contracts](https://martinfowler.com/articles/consumerDrivenContracts.html)
- [Zod documentation](https://zod.dev/)
- [OpenAI, Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs)

## Evals as regression tests

Agent demos often show the happy path. This repo also tests failure modes: malformed output, strict schema rejection and unsupported claims. The point is to make the pipeline harder to fool with a good-looking final answer.

References:

- [Anthropic, Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)
- [OpenAI Evals](https://github.com/openai/evals)

## Run logs as a small evidence surface

This is not a production observability stack. The JSONL run log is a small local version of the same idea: a run should leave enough trace data that someone can inspect what happened after the fact.

Reference: [OpenTelemetry documentation](https://opentelemetry.io/docs/)

## Human review gates

Schemas can prove that a field exists. They cannot prove that a claim should be published, sent to a customer or used in a decision. The review gate exists for that second question.

That is the core position of the repo: useful agent pipelines need contracts, evals, logs and review gates before they need more agents.
