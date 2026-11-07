import bn from '@/translations/bn.json';
import en from '@/translations/en.json';

function keyPaths(value: object, prefix = ''): string[] {
  return Object.entries(value).flatMap(([key, child]) =>
    typeof child === 'object' && child !== null
      ? keyPaths(child, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  ).sort();
}

describe('translations', () => {
  it('has the same keys in English and Bangla', () => {
    expect(keyPaths(bn)).toEqual(keyPaths(en));
  });
});
