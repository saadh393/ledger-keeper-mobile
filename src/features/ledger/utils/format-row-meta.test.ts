import { formatRowMeta } from '@/features/ledger/utils/format-row-meta';

describe('formatRowMeta', () => {
  it('shows the category alone for a book-currency amount', () => {
    expect(formatRowMeta({ category: 'Food', original: null }, 'en')).toBe('Food');
  });

  it('adds the original amount for a foreign amount', () => {
    expect(formatRowMeta({ category: 'Food', original: { amount: 12, currency: 'USD', rate: 121.5 } }, 'en')).toBe('Food · $12 at 121.5');
  });

  it('uses Bangla digits in Bangla', () => {
    expect(formatRowMeta({ category: 'খাবার', original: { amount: 12, currency: 'USD', rate: 121.5 } }, 'bn')).toBe('খাবার · $১২ at ১২১.৫');
  });

  it('shows only the original amount when the category is empty', () => {
    expect(formatRowMeta({ category: '', original: { amount: 12, currency: 'USD', rate: 121.5 } }, 'en')).toBe('$12 at 121.5');
  });
});
