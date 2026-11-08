import { formatDayHeader } from '@/lib/format/day-header';
import i18n from '@/lib/i18n';

const noon = '2026-11-07T06:00:00Z';
const dhakaMidnight = '2026-11-07T18:30:00Z';
const newYear = '2027-01-01T04:00:00Z';

describe('formatDayHeader', () => {
  it.each([
    { value: '2026-11-07T01:00:00Z', now: noon, en: 'Today', bn: 'আজ' },
    { value: '2026-11-06T10:00:00Z', now: noon, en: 'Yesterday', bn: 'গতকাল' },
    { value: '2026-11-03T10:00:00Z', now: noon, en: '3 Nov', bn: '৩ নভে' },
    { value: '2026-11-08T06:00:00Z', now: noon, en: '8 Nov', bn: '৮ নভে' },
    { value: '2026-11-07T18:10:00Z', now: dhakaMidnight, en: 'Today', bn: 'আজ' },
    { value: '2026-11-07T17:00:00Z', now: dhakaMidnight, en: 'Yesterday', bn: 'গতকাল' },
    { value: '2026-12-31T12:00:00Z', now: newYear, en: 'Yesterday', bn: 'গতকাল' },
  ])('labels $value seen at $now as $en', ({ value, now, en, bn }) => {
    expect(formatDayHeader(value, 'en', now)).toBe(en);
    expect(formatDayHeader(value, 'bn', now)).toBe(bn);
  });

  it('accepts Dates', () => {
    expect(formatDayHeader(new Date('2026-11-06T10:00:00Z'), 'en', new Date(noon))).toBe('Yesterday');
  });

  it.each([
    { language: 'bn', locale: 'en', expected: 'Today' },
    { language: 'en', locale: 'bn', expected: 'আজ' },
  ] as const)('labels in $locale while i18next is set to $language', async ({ language, locale, expected }) => {
    await i18n.changeLanguage(language);
    expect(formatDayHeader('2026-11-07T01:00:00Z', locale, noon)).toBe(expected);
  });
});
