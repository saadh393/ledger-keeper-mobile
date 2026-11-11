import type { ArtifactTransaction } from '@/features/assistant/schemas/transaction-artifact-schemas';

export function getNet(rows: ArtifactTransaction[]): number {
  return rows.reduce((sum, row) => (row.deleted ? sum : sum + (row.kind === 'income' ? row.amount : -row.amount)), 0);
}
