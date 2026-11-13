import * as React from 'react';
import { useLedgerPreferencesStore } from '@/features/ledger/store/use-ledger-preferences-store';
import { SettingsScreen } from '@/features/settings/settings-screen';
import { act, fireEvent, render, screen } from '@/lib/test-utils';

describe('settingsScreen', () => {
  afterEach(() => {
    act(() => useLedgerPreferencesStore.setState({ showSummary: true }));
  });

  it('has a Show summary checkbox that hides and shows the Ledger summary strip', () => {
    render(<SettingsScreen />);
    const toggle = screen.getByRole('checkbox', { name: 'Show summary' });
    expect(toggle.props.accessibilityState.checked).toBe(true);
    fireEvent.press(toggle);
    expect(useLedgerPreferencesStore.getState().showSummary).toBe(false);
  });
});
