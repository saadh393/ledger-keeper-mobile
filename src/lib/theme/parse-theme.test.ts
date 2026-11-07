import { parseTheme } from '@/lib/theme/parse-theme';

describe('parseTheme', () => {
  it.each(['light', 'dark'])('keeps %s', (value) => {
    expect(parseTheme(value)).toBe(value);
  });

  it.each([undefined, null, '', 'system', 'Light', 42, {}])('falls back to dark for %p', (value) => {
    expect(parseTheme(value)).toBe('dark');
  });
});
