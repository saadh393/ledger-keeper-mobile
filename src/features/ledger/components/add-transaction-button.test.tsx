import * as React from 'react';
import { AddTransactionButton } from '@/features/ledger/components/add-transaction-button';
import { fireEvent, render, screen } from '@/lib/test-utils';

describe('addTransactionButton', () => {
  it('renders the floating pill button and responds to press', () => {
    const onPress = jest.fn();
    render(<AddTransactionButton onPress={onPress} />);

    const button = screen.getByTestId('ledger-add-transaction-button');
    expect(button).toBeOnTheScreen();
    expect(screen.getByText('Add transaction')).toBeOnTheScreen();

    fireEvent.press(button);
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
