import * as React from 'react';
import { TransactionDatePicker } from '@/features/ledger/components/transaction-date-picker';
import { toDayKey } from '@/lib/format/day-key';
import { fireEvent, render, screen } from '@/lib/test-utils';

describe('transactionDatePicker', () => {
  it('disables future days so user cannot choose a future day', () => {
    const today = new Date();
    const todayKey = toDayKey(today);

    render(
      <TransactionDatePicker
        selected={today.toISOString()}
        onSelect={jest.fn()}
        onBack={jest.fn()}
      />,
    );

    const parts = todayKey.split('-').map(Number);
    const day = parts[2];
    const daysInMonth = new Date(parts[0], parts[1], 0).getDate();

    if (day < daysInMonth) {
      const futureDayStr = String(day + 1).padStart(2, '0');
      const monthStr = String(parts[1]).padStart(2, '0');
      const futureDayKey = `${parts[0]}-${monthStr}-${futureDayStr}`;

      const futureButton = screen.getByTestId(`date-picker-day-${futureDayKey}`);
      expect(futureButton.props.accessibilityState.disabled).toBe(true);
    }
  });

  it('selects today and yesterday via shortcut buttons', () => {
    const onSelect = jest.fn();
    render(
      <TransactionDatePicker
        selected={new Date().toISOString()}
        onSelect={onSelect}
        onBack={jest.fn()}
      />,
    );

    fireEvent.press(screen.getByTestId('date-picker-today'));
    expect(onSelect).toHaveBeenCalledTimes(1);

    fireEvent.press(screen.getByTestId('date-picker-yesterday'));
    expect(onSelect).toHaveBeenCalledTimes(2);
  });

  it('calls onBack when back button is pressed', () => {
    const onBack = jest.fn();
    render(
      <TransactionDatePicker
        selected={new Date().toISOString()}
        onSelect={jest.fn()}
        onBack={onBack}
      />,
    );

    fireEvent.press(screen.getByTestId('transaction-date-picker-back'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
