import type { z } from 'zod';

export function getFormFieldErrors<K extends string>(error: z.ZodError): Partial<Record<K, string>> {
  const fields: Partial<Record<K, string>> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0]) as K;
    fields[key] ??= issue.message;
  }
  return fields;
}
