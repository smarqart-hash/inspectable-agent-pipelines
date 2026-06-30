# Public / Private Boundary

This repository is designed to be public-safe.

## Public

Allowed in this repo:

- synthetic product requests,
- deterministic mock outputs,
- generic agent-engineering patterns,
- run packets generated from public-safe examples,
- review artifacts about this repository itself.

## Not Public

Do not add:

- private client or project names,
- unpublished research artifacts,
- internal agent registries,
- real operational server details,
- credentials,
- live API traces that contain private prompts or outputs.

## Live Adapters Later

If a live model adapter is added later, it should remain opt-in.

The default path must stay:

```bash
npm install
npm test
npm run demo
```

No API key should be required for a reviewer to understand the project.
