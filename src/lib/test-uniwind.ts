import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { Uniwind } from 'uniwind';

type ThemeName = 'light' | 'dark';
type Compiled = { scopedVars: Record<string, Record<string, string>> };

const uniwindDir = path.dirname(require.resolve('uniwind/package.json'));
const { generateCSSForThemes } = require(path.join(uniwindDir, 'src/css/themes'));
const { compileVirtual } = require(path.join(uniwindDir, 'src/metro/compileVirtual'));
const cssPath = path.join(__dirname, '../global.css');
const themes: ThemeName[] = ['light', 'dark'];

export async function loadUniwindStyles(candidates: string[]) {
  const themeCSS: string = await generateCSSForThemes(themes, cssPath);
  const code: string = await compileVirtual({
    css: `${fs.readFileSync(cssPath, 'utf8')}\n${themeCSS}`,
    cssPath,
    platform: 'ios',
    themes,
    polyfills: undefined,
    debug: false,
    candidates,
  });
  const factory = vm.runInThisContext(`rt => ${code}`) as (rt: unknown) => Compiled;
  (Uniwind as unknown as { __reinit: (f: typeof factory, t: ThemeName[]) => void }).__reinit(factory, themes);
  return factory({});
}
