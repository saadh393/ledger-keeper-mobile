import { BottomSheetModal } from '@gorhom/bottom-sheet';
import * as React from 'react';
import { LedgerSortSheet } from '@/features/ledger/components/ledger-sort-sheet';
import { useLedgerFiltersStore } from '@/features/ledger/store/use-ledger-filters-store';
import { cleanup, fireEvent, render, screen } from '@/lib/test-utils';

afterEach(() => {
  cleanup();
  useLedgerFiltersStore.setState({ sort: 'newest' });
});

describe('ledgerSortSheet', () => {
  it('shows the title and all four options with the current one checked', () => {
    useLedgerFiltersStore.setState({ sort: 'highest' });
    render(<LedgerSortSheet onDismiss={jest.fn()} />);

    expect(screen.getByTestId('ledger-sort-sheet-title')).toHaveTextContent('Sort');
    expect(screen.getByText('Newest first')).toBeOnTheScreen();
    expect(screen.getByText('Oldest first')).toBeOnTheScreen();
    expect(screen.getByText('Highest amount')).toBeOnTheScreen();
    expect(screen.getByText('Lowest amount')).toBeOnTheScreen();
    expect(screen.getByTestId('ledger-sort-check-highest')).toBeOnTheScreen();
    expect(screen.queryByTestId('ledger-sort-check-newest')).not.toBeOnTheScreen();
  });

  it('sizes to its content instead of a fixed snap point', () => {
    render(<LedgerSortSheet onDismiss={jest.fn()} />);

    const modal = screen.UNSAFE_getByType(BottomSheetModal);
    expect(modal.props.snapPoints).toBeUndefined();
    expect(modal.props.enableDynamicSizing).toBe(true);
  });

  it('applies the picked option and closes', () => {
    const onDismiss = jest.fn();
    render(<LedgerSortSheet onDismiss={onDismiss} />);

    fireEvent.press(screen.getByTestId('ledger-sort-option-lowest'));

    expect(useLedgerFiltersStore.getState().sort).toBe('lowest');
    expect(onDismiss).toHaveBeenCalled();
  });
});
