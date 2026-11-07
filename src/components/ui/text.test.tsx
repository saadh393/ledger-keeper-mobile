import { render, screen } from '@testing-library/react-native';
import { isLoaded } from 'expo-font';
import * as React from 'react';
import { StyleSheet } from 'react-native';

import { Text } from '@/components/ui/text';
import i18n from '@/lib/i18n';
import { loadUniwindStyles } from '@/lib/test-uniwind';

jest.mock('expo-font', () => ({ isLoaded: jest.fn() }));

const mockIsLoaded = jest.mocked(isLoaded);

function textStyle(className?: string) {
  render(<Text testID="text" className={className}>111.11</Text>);
  return StyleSheet.flatten(screen.getByTestId('text').props.style);
}

beforeAll(async () => {
  await loadUniwindStyles([
    'text-body',
    'text-headline',
    'text-hero',
    'text-black',
    'font-bold',
    'tabular-nums',
    'font-manrope-400',
    'font-manrope-500',
    'font-manrope-600',
    'font-manrope-700',
    'font-bengali-500',
  ]);
});

beforeEach(async () => {
  mockIsLoaded.mockReturnValue(true);
  await i18n.changeLanguage('en');
});

describe('text', () => {
  it('uses Manrope regular at body size by default', () => {
    const style = textStyle();
    expect(style).toMatchObject({ fontSize: 15, fontFamily: 'Manrope_400Regular' });
    expect(style.fontWeight).toBeUndefined();
  });

  it.each([
    ['text-headline', 28, 'Manrope_500Medium'],
    ['text-hero', 22, 'Manrope_600SemiBold'],
    ['text-body font-bold', 15, 'Manrope_700Bold'],
  ])('%s uses its own weight file without a synthetic weight', (className, fontSize, fontFamily) => {
    const style = textStyle(className);
    expect(style).toMatchObject({ fontSize, fontFamily });
    expect(style.fontWeight).toBeUndefined();
  });

  it('uses Noto Sans Bengali at the same size and weight in Bangla', async () => {
    await i18n.changeLanguage('bn');
    expect(textStyle('text-headline')).toMatchObject({ fontSize: 28, fontFamily: 'NotoSansBengali_500Medium' });
  });

  it('falls back to the system font with the class weight when fonts fail to load', () => {
    mockIsLoaded.mockReturnValue(false);
    const style = textStyle('text-headline');
    expect(style).toMatchObject({ fontSize: 28, fontWeight: 500 });
    expect(style.fontFamily).toBeUndefined();
  });

  it('applies tabular figures', () => {
    expect(textStyle('tabular-nums').fontVariant).toEqual(['tabular-nums']);
  });

  it('keeps font scaling on', () => {
    render(<Text testID="text">999.99</Text>);
    expect(screen.getByTestId('text').props.allowFontScaling).not.toBe(false);
  });
});
