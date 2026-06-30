export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

export function createRunId(input: string): string {
  const slug = slugify(input);
  return slug.length > 0 ? slug : 'agent-pipeline-run';
}
