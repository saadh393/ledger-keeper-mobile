import type { i18n as I18n } from 'i18next';
import { getLocales } from 'expo-localization';

const mockGetLocales = jest.mocked(getLocales);

function loadI18n(languageTag: string) {
  mockGetLocales.mockReturnValue([{ languageTag } as ReturnType<typeof getLocales>[number]]);
  let instance: I18n | undefined;
  jest.isolateModules(() => {
    instance = require('@/lib/i18n').default;
  });
  return instance!;
}

describe('i18n', () => {
  it.each(['bn-BD', 'bn-IN'])('uses Bangla when the phone is set to %s', (tag) => {
    expect(loadI18n(tag).t('home.title')).toBe('লেজার কিপার');
  });

  it.each(['en-US', 'hi-IN', 'ar-SA'])('uses English when the phone is set to %s', (tag) => {
    expect(loadI18n(tag).t('home.title')).toBe('Ledger Keeper');
  });

  it('never switches the layout to right-to-left', () => {
    mockGetLocales.mockReturnValue([{ languageTag: 'ar-SA' } as ReturnType<typeof getLocales>[number]]);
    jest.isolateModules(() => {
      const { I18nManager } = require('react-native');
      const forceRTL = jest.spyOn(I18nManager, 'forceRTL');
      const allowRTL = jest.spyOn(I18nManager, 'allowRTL');
      require('@/lib/i18n');
      expect(forceRTL).not.toHaveBeenCalled();
      expect(allowRTL).not.toHaveBeenCalled();
    });
  });

  it('shows English for a key missing from Bangla', () => {
    const i18n = loadI18n('bn-BD');
    i18n.addResource('en', 'translation', 'only_in_english', 'English text');
    expect(i18n.t('only_in_english' as never)).toBe('English text');
  });

  it.each([
    ['en-US', '3 entries'],
    ['bn-BD', '৩টি এন্ট্রি 3'],
  ])('interpolates values in %s', (tag, expected) => {
    const i18n = loadI18n(tag);
    i18n.addResource('en', 'translation', 'entries', '{{count}} entries');
    i18n.addResource('bn', 'translation', 'entries', '৩টি এন্ট্রি {{count}}');
    expect(i18n.t('entries' as never, { count: 3 })).toBe(expected);
  });
});
