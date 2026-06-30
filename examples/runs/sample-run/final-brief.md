# Implementation Brief

## Procurement notice summarizer extension

Target user: small suppliers.

### Scope
- Parse one supported procurement notice page format.
- Produce a short summary with retained source links.
- Show uncertainty when required fields are missing.

### First Steps
1. Create fixtures from public procurement notices.
2. Define extraction and summary output contracts.
3. Build a browser-side parser for the first supported page format.
4. Render a source-linked summary panel.
5. Add regression tests for malformed notices.

### Kept Claims
- C-001: The target users are small suppliers.
- C-002: The MVP should preserve source links in summaries.

### Dropped During Review
- C-003: Drop the claim or add a checked evidence reference.
