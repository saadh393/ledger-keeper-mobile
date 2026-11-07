import type { ColorToken, ThemeName } from '@/lib/theme/colors';
import { render, screen } from '@testing-library/react-native';
import * as React from 'react';

import { Uniwind } from 'uniwind';

import { loadUniwindStyles } from '@/lib/test-uniwind';
import { colors } from '@/lib/theme/colors';

const themes: ThemeName[] = ['light', 'dark'];
const tokens = Object.keys(colors.light) as ColorToken[];
const { View } = require('uniwind/components/View');

let compiled: Awaited<ReturnType<typeof loadUniwindStyles>>;

beforeAll(async () => {
  compiled = await loadUniwindStyles(tokens.map(token => `bg-${token}`));
});

describe('color tokens', () => {
  it.each(themes)('global.css %s variables match the typed token map', (theme) => {
    const cssVars = compiled.scopedVars[`__uniwind-theme-${theme}`];
    const cssColors = Object.fromEntries(
      Object.keys(cssVars).map(name => [name.replace('--color-', ''), cssVars[name].toLowerCase()]),
    );
    expect(cssColors).toEqual(colors[theme]);
  });

  it.each(themes)('bg-* classes render the %s token values', (theme) => {
    Uniwind.setTheme(theme);
    tokens.forEach((token) => {
      const tokenClass = `bg-${token}`;
      render(<View testID={token} className={tokenClass} />);
      expect(screen.getByTestId(token)).toHaveStyle({ backgroundColor: colors[theme][token] });
    });
  });
});
