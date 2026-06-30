export const FIXED_GENERATED_AT = '2026-06-30T12:00:00.000Z';

export function applyOverrides<T extends object>(base: T, overrides?: Partial<T>): T {
  return {
    ...base,
    ...overrides,
  };
}
