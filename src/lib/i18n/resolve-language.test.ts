import { resolveLanguage } from '@/lib/i18n/resolve-language';

describe('resolveLanguage', () => {
  it.each(['bn', 'bn-BD', 'bn-IN', 'BN_bd'])('picks Bangla for %s', (tag) => {
    expect(resolveLanguage(tag)).toBe('bn');
  });

  it.each(['en', 'en-US', 'hi-IN', 'ar-SA', 'ar', 'bnx', null, undefined])('picks English for %s', (tag) => {
    expect(resolveLanguage(tag)).toBe('en');
  });
});
