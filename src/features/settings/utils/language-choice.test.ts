import { getProfileLanguage, parseLanguageChoice, resolveLanguageChoice } from '@/features/settings/utils/language-choice';

describe('language choice', () => {
  it('defaults to phone language', () => {
    expect(parseLanguageChoice(undefined)).toBe('system');
    expect(parseLanguageChoice('fr')).toBe('system');
    expect(parseLanguageChoice('bn')).toBe('bn');
  });

  it('follows the device for phone language', () => {
    expect(resolveLanguageChoice('system', 'bn-BD')).toBe('bn');
    expect(resolveLanguageChoice('system', 'en-US')).toBe('en');
    expect(resolveLanguageChoice('system', null)).toBe('en');
  });

  it('uses the chosen language', () => {
    expect(resolveLanguageChoice('en', 'bn-BD')).toBe('en');
    expect(resolveLanguageChoice('bn', 'en-US')).toBe('bn');
  });

  it('applies a saved profile locale only when nothing was chosen on the device', () => {
    expect(getProfileLanguage('system', 'bn')).toBe('bn');
    expect(getProfileLanguage('system', 'en')).toBe('en');
    expect(getProfileLanguage('system', undefined)).toBeNull();
    expect(getProfileLanguage('system', 'fr')).toBeNull();
    expect(getProfileLanguage('en', 'bn')).toBeNull();
    expect(getProfileLanguage('bn', 'en')).toBeNull();
  });
});
