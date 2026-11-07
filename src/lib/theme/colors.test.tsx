import type { ColorToken, ThemeName } from '@/lib/theme/colors';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { render, screen } from '@testing-library/react-native';
import * as React from 'react';

import { Uniwind } from 'uniwind';
import { colors } from '@/lib/theme/colors';

const uniwindDir = path.dirname(require.resolve('uniwind/package.json'));
const { generateCSSForThemes } = require(path.join(uniwindDir, 'src/css/themes'));
const { compileVirtual } = require(path.join(uniwindDir, 'src/metro/compileVirtual'));
const { View } = require('uniwind/components/View');

const themes: ThemeName[] = ['light', 'dark'];
const tokens = Object.keys(colors.light) as ColorToken[];
const cssPath = path.join(__dirname, '../../global.css');

type Compiled = { scopedVars: Record<string, Record<string, string>> };

let compiled: Compiled;

beforeAll(async () => {
  const themeCSS: string = await generateCSSForThemes(themes, cssPath);
  const code: string = await compileVirtual({
    css: `${fs.readFileSync(cssPath, 'utf8')}\n${themeCSS}`,
    cssPath,
    platform: 'ios',
    themes,
    polyfills: undefined,
    debug: false,
    candidates: tokens.map(token => `bg-${token}`),
  });
  const factory = vm.runInThisContext(`rt => ${code}`) as (rt: unknown) => Compiled;
  (Uniwind as unknown as { __reinit: (f: typeof factory, t: ThemeName[]) => void }).__reinit(factory, themes);
  compiled = factory({});
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
