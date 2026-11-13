import * as React from 'react';
import { LedgerMoreButton } from '@/features/ledger/components/ledger-more-button';
import { useLedgerPreferencesStore } from '@/features/ledger/store/use-ledger-preferences-store';
import { act, fireEvent, render, screen } from '@/lib/test-utils';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('ledgerMoreButton', () => {
  it('opens Manage categories from the ⋯ menu', async () => {
    render(<LedgerMoreButton />);
    fireEvent.press(screen.getByTestId('ledger-more-button'));
    expect(await screen.findByTestId('ledger-more-menu-categories-label')).toHaveTextContent('Manage categories');
    fireEvent.press(screen.getByTestId('ledger-more-menu-categories'));
    expect(mockPush).toHaveBeenCalledWith('/categories');
  });

  it('turns the summary strip off and on from the ⋯ menu', async () => {
    act(() => useLedgerPreferencesStore.setState({ showSummary: false }));
    render(<LedgerMoreButton />);
    fireEvent.press(screen.getByTestId('ledger-more-button'));
    const toggle = await screen.findByTestId('ledger-summary-toggle');
    expect(toggle.props.accessibilityState.checked).toBe(false);
    fireEvent.press(toggle);
    expect(useLedgerPreferencesStore.getState().showSummary).toBe(true);
    expect(screen.getByTestId('ledger-summary-toggle').props.accessibilityState.checked).toBe(true);
  });
});
