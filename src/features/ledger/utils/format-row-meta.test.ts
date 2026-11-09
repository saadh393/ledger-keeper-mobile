import { formatRowMeta } from '@/features/ledger/utils/format-row-meta';

const dateIso = '2026-11-02T20:00:00.000Z';

describe('formatRowMeta', () => {
  it('shows the category alone for a book-currency amount', () => {
    expect(formatRowMeta({ dateIso, category: 'Food', original: null }, 'en')).toBe('Food');
  });

  it('adds the original amount for a foreign amount', () => {
    expect(formatRowMeta({ dateIso, category: 'Food', original: { amount: 12, currency: 'USD', rate: 121.5 } }, 'en')).toBe('Food · $12 at 121.5');
  });

  it('uses Bangla digits in Bangla', () => {
    expect(formatRowMeta({ dateIso, category: 'খাবার', original: { amount: 12, currency: 'USD', rate: 121.5 } }, 'bn')).toBe('খাবার · $১২ at ১২১.৫');
  });

  it('shows only the original amount when the category is empty', () => {
    expect(formatRowMeta({ dateIso, category: '', original: { amount: 12, currency: 'USD', rate: 121.5 } }, 'en')).toBe('$12 at 121.5');
  });

  it('starts with the Dhaka date when asked', () => {
    expect(formatRowMeta({ dateIso, category: 'Food', original: null }, 'en', true)).toBe('3 Nov · Food');
  });

  it('starts with the Bangla date in Bangla', () => {
    expect(formatRowMeta({ dateIso, category: 'খাবার', original: { amount: 12, currency: 'USD', rate: 121.5 } }, 'bn', true)).toBe('৩ নভে · খাবার · $১২ at ১২১.৫');
  });

  it('shows only the date when there is no category or original amount', () => {
    expect(formatRowMeta({ dateIso, category: '', original: null }, 'en', true)).toBe('3 Nov');
  });
});
