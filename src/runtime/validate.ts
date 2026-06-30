import type { z } from 'zod';

export class SchemaValidationError extends Error {
  constructor(
    public readonly label: string,
    public readonly issues: z.ZodIssue[],
  ) {
    super(`[${label}] schema validation failed: ${issues.map((issue) => issue.message).join('; ')}`);
    this.name = 'SchemaValidationError';
  }
}

export function validateOrThrow<T>(schema: z.ZodSchema<T>, raw: unknown, label: string): T {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw new SchemaValidationError(label, parsed.error.issues);
  }

  return parsed.data;
}
