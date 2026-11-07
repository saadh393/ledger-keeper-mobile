const light = {
  'paper-100': '#ffffff',
  'paper-200': '#f0f4f9',
  'surface': '#ffffff',
  'surface-container': '#f0f4f9',
  'border': '#e3e6ea',
  'border-strong': '#c4c7c5',
  'ink-900': '#1f1f1f',
  'ink-700': '#444746',
  'ink-500': '#575b5f',
  'accent': '#1a73e8',
  'on-accent': '#ffffff',
  'link': '#1a73e8',
  'selected': '#d3e3fd',
  'on-selected': '#041e49',
  'forest-500': '#188038',
  'forest-100': '#ceead6',
  'clay-500': '#d93025',
  'clay-100': '#fce8e6',
  'wheat-500': '#f9ab00',
  'wheat-200': '#fef7e0',
  'brand-blue': '#4285f4',
  'brand-green': '#34a853',
  'brand-yellow': '#fbbc04',
  'brand-red': '#ea4335',
};

export type ColorToken = keyof typeof light;

export type ThemeName = 'light' | 'dark';

export type ThemeColors = Record<ColorToken, string>;

const dark: ThemeColors = {
  'paper-100': '#131314',
  'paper-200': '#282a2c',
  'surface': '#1e1f20',
  'surface-container': '#1e1f20',
  'border': '#333537',
  'border-strong': '#444746',
  'ink-900': '#e3e3e3',
  'ink-700': '#c4c7c5',
  'ink-500': '#a8abaf',
  'accent': '#8ab4f8',
  'on-accent': '#062e6f',
  'link': '#8ab4f8',
  'selected': '#1f3760',
  'on-selected': '#d3e3fd',
  'forest-500': '#81c995',
  'forest-100': '#0f2e1a',
  'clay-500': '#f28b82',
  'clay-100': '#3c1714',
  'wheat-500': '#fdd663',
  'wheat-200': '#3a2f0b',
  'brand-blue': '#8ab4f8',
  'brand-green': '#81c995',
  'brand-yellow': '#fdd663',
  'brand-red': '#f28b82',
};

export const colors: Record<ThemeName, ThemeColors> = { light, dark };
