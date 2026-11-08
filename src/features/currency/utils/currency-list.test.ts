import { filterCurrencies, getOrderedCurrencies } from '@/features/currency/utils/currency-list';

describe('currency-list utils', () => {
  describe('getOrderedCurrencies', () => {
    it('places BDT first when current currency is BDT', () => {
      const list = getOrderedCurrencies('BDT');
      expect(list[0].code).toBe('BDT');
      expect(list[0].name).toBe('Bangladeshi Taka');
      expect(list[0].symbol).toBe('৳');

      // Ensure BDT is not duplicated
      const bdtItems = list.filter(c => c.code === 'BDT');
      expect(bdtItems).toHaveLength(1);

      // Remaining items are sorted alphabetically by code
      const remainingCodes = list.slice(1).map(c => c.code);
      const sortedRemainingCodes = [...remainingCodes].sort();
      expect(remainingCodes).toEqual(sortedRemainingCodes);
    });

    it('places BDT first and current currency second when current currency is not BDT', () => {
      const list = getOrderedCurrencies('USD');
      expect(list[0].code).toBe('BDT');
      expect(list[1].code).toBe('USD');
      expect(list[1].name).toBe('US Dollar');
      expect(list[1].symbol).toBe('$');

      // Neither BDT nor USD are duplicated
      expect(list.filter(c => c.code === 'BDT')).toHaveLength(1);
      expect(list.filter(c => c.code === 'USD')).toHaveLength(1);

      // Remaining items are sorted alphabetically by code
      const remainingCodes = list.slice(2).map(c => c.code);
      const sortedRemainingCodes = [...remainingCodes].sort();
      expect(remainingCodes).toEqual(sortedRemainingCodes);
    });

    it('handles lowercase or un-trimmed current currency correctly', () => {
      const list = getOrderedCurrencies('  eur  ');
      expect(list[0].code).toBe('BDT');
      expect(list[1].code).toBe('EUR');
      expect(list[1].name).toBe('Euro');
      expect(list[1].symbol).toBe('€');
      expect(list.filter(c => c.code === 'EUR')).toHaveLength(1);
    });

    it('places BDT first when current currency is null or undefined', () => {
      const list = getOrderedCurrencies(null);
      expect(list[0].code).toBe('BDT');
      const undefinedList = getOrderedCurrencies(undefined);
      expect(undefinedList[0].code).toBe('BDT');
    });

    it('handles unknown currency gracefully by placing it second', () => {
      const list = getOrderedCurrencies('XYZ');
      expect(list[0].code).toBe('BDT');
      expect(list[1].code).toBe('XYZ');
    });
  });

  describe('filterCurrencies', () => {
    it('returns all currencies when search query is empty or whitespace', () => {
      const list = getOrderedCurrencies('USD');
      expect(filterCurrencies(list, '')).toEqual(list);
      expect(filterCurrencies(list, '   ')).toEqual(list);
    });

    it('filters by code, case-insensitive (e.g. "usd")', () => {
      const list = getOrderedCurrencies('USD');
      const result = filterCurrencies(list, 'usd');
      expect(result.some(c => c.code === 'USD')).toBe(true);
      expect(result.every(c =>
        c.code.toLowerCase().includes('usd') || c.name.toLowerCase().includes('usd'),
      )).toBe(true);
    });

    it('filters by name, case-insensitive (e.g. "taka", "Euro")', () => {
      const list = getOrderedCurrencies('USD');
      const takaResult = filterCurrencies(list, 'taka');
      expect(takaResult.some(c => c.code === 'BDT')).toBe(true);

      const euroResult = filterCurrencies(list, 'Euro');
      expect(euroResult.some(c => c.code === 'EUR')).toBe(true);
    });

    it('returns empty array when no currency matches', () => {
      const list = getOrderedCurrencies('USD');
      const result = filterCurrencies(list, 'nonexistentcurrencyname12345');
      expect(result).toEqual([]);
    });
  });
});
