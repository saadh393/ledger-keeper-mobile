import { act, renderHook } from '@testing-library/react-native';
import { useLedgerMonth } from '@/features/ledger/hooks/use-ledger-month';
import { useLedgerMonthSync } from '@/features/ledger/hooks/use-ledger-month-sync';

function useSyncedLedgerMonth() {
  useLedgerMonthSync();
  return useLedgerMonth();
}

describe('useLedgerMonth', () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: new Date('2024-03-10T06:00:00Z') });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('exposes the first and last Dhaka day of the selected month', () => {
    const { result } = renderHook(() => useSyncedLedgerMonth());
    expect(result.current).toMatchObject({ firstDay: '2024-03-01', lastDay: '2024-03-31', isCurrentMonth: true });
    act(() => result.current.goToPreviousMonth());
    expect(result.current).toMatchObject({ firstDay: '2024-02-01', lastDay: '2024-02-29', isCurrentMonth: false });
    act(() => result.current.goToNextMonth());
    expect(result.current).toMatchObject({ firstDay: '2024-03-01', lastDay: '2024-03-31' });
  });

  it('does not move past the current month', () => {
    const { result } = renderHook(() => useSyncedLedgerMonth());
    act(() => result.current.goToNextMonth());
    expect(result.current.month).toEqual({ year: 2024, month: 3 });
  });
});
