import type { CurrencyItem } from '@/features/currency/data/currencies';
import { ISO_4217_CURRENCIES } from '@/features/currency/data/currencies';

export function getOrderedCurrencies(
  currentCurrency?: string | null,
  allCurrencies: CurrencyItem[] = ISO_4217_CURRENCIES,
): CurrencyItem[] {
  const normCurrent = currentCurrency ? currentCurrency.trim().toUpperCase() : null;

  const bdt = allCurrencies.find(c => c.code === 'BDT') ?? {
    code: 'BDT',
    name: 'Bangladeshi Taka',
    symbol: '৳',
  };

  const isCurrentBdt = normCurrent === 'BDT' || !normCurrent;

  let currentItem: CurrencyItem | null = null;
  if (!isCurrentBdt && normCurrent) {
    currentItem = allCurrencies.find(c => c.code === normCurrent) ?? {
      code: normCurrent,
      name: normCurrent,
      symbol: normCurrent,
    };
  }

  const rest = allCurrencies
    .filter(c => c.code !== 'BDT' && (!currentItem || c.code !== currentItem.code))
    .slice()
    .sort((a, b) => a.code.localeCompare(b.code));

  return [
    bdt,
    ...(currentItem ? [currentItem] : []),
    ...rest,
  ];
}

export function filterCurrencies(
  currencies: CurrencyItem[],
  searchQuery: string,
): CurrencyItem[] {
  const query = searchQuery.trim().toLowerCase();
  if (!query) {
    return currencies;
  }

  return currencies.filter(
    item =>
      item.code.toLowerCase().includes(query)
      || item.name.toLowerCase().includes(query),
  );
}
