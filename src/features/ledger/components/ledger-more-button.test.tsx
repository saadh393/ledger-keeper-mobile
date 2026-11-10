import * as React from 'react';
import { LedgerMoreButton } from '@/features/ledger/components/ledger-more-button';
import { fireEvent, render, screen } from '@/lib/test-utils';

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
});
