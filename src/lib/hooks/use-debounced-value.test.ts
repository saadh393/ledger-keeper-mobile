import { act, renderHook } from '@testing-library/react-native';
import { useDebouncedValue } from '@/lib/hooks/use-debounced-value';

describe('useDebouncedValue', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('starts with the initial value', () => {
    const { result } = renderHook(() => useDebouncedValue('a', 250));
    expect(result.current).toBe('a');
  });

  it('updates only after the value has been still for the delay', () => {
    const { result, rerender } = renderHook(({ value }: { value: string }) => useDebouncedValue(value, 250), { initialProps: { value: '' } });

    rerender({ value: 'l' });
    act(() => jest.advanceTimersByTime(200));
    rerender({ value: 'lu' });
    act(() => jest.advanceTimersByTime(200));
    expect(result.current).toBe('');

    act(() => jest.advanceTimersByTime(50));
    expect(result.current).toBe('lu');
  });
});
