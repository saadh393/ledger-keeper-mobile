import { formatCopyText } from '@/features/ledger/utils/format-copy-text';

const row = { name: 'Lunch', amount: 250, kind: 'expense' as const, dateIso: '2026-11-03T06:00:00.000Z' };

describe('formatCopyText', () => {
  it('joins the title, signed amount and date', () => {
    expect(formatCopyText(row, 'en', 'BDT')).toBe('Lunch · −৳250 · 3 Nov 2026');
  });

  it('signs income with a plus', () => {
    expect(formatCopyText({ ...row, kind: 'income' }, 'en', 'BDT')).toBe('Lunch · +৳250 · 3 Nov 2026');
  });

  it('uses the app language for the amount and date', () => {
    expect(formatCopyText(row, 'bn', 'BDT')).toBe('Lunch · −৳২৫০ · ৩ নভে ২০২৬');
  });
});
