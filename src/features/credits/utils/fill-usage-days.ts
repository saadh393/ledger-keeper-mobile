import type { CreditUsagePoint } from '@/features/credits/schemas/credit-usage-schema';

const dayMs = 86_400_000;

export function fillUsageDays(points: CreditUsagePoint[], today: Date, days = 30): CreditUsagePoint[] {
  const credits = new Map<string, number>();
  for (const point of points) {
    const key = point.date.slice(0, 10);
    credits.set(key, (credits.get(key) ?? 0) + point.credits);
  }
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today.getTime() - (days - 1 - index) * dayMs).toISOString().slice(0, 10);
    return { date, credits: credits.get(date) ?? 0 };
  });
}
