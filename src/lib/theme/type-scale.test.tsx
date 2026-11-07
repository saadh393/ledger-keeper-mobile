import { renderHook } from '@testing-library/react-native';
import { useResolveClassNames } from 'uniwind';

import { loadUniwindStyles } from '@/lib/test-uniwind';

const typeScale = [
  ['text-headline', 28, 500],
  ['text-title', 20, 500],
  ['text-hero', 22, 600],
  ['text-body-l', 16, 400],
  ['text-body', 15, 400],
  ['text-row-title', 15, 500],
  ['text-label', 13, 500],
  ['text-meta', 12, 400],
] as const;

beforeAll(async () => {
  await loadUniwindStyles([...typeScale.map(([name]) => name), 'tabular-nums']);
});

describe('type scale', () => {
  it.each(typeScale)('%s resolves to size %i and weight %i', (name, fontSize, fontWeight) => {
    const { result } = renderHook(() => useResolveClassNames(name));
    expect(result.current).toEqual({ fontSize, fontWeight });
  });

  it('tabular-nums sets tabular figures', () => {
    const { result } = renderHook(() => useResolveClassNames('tabular-nums'));
    expect(result.current).toEqual({ fontVariant: ['tabular-nums'] });
  });
});
