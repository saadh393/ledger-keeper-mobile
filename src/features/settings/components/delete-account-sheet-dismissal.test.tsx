import MockAdapter from 'axios-mock-adapter';
import * as React from 'react';
import { BackHandler } from 'react-native';
import { DeleteAccountSheet } from '@/features/settings/components/delete-account-sheet';
import { apiClient } from '@/lib/api/client';
import { act, fireEvent, render, screen, waitFor } from '@/lib/test-utils';

jest.mock('react-native-flash-message', () => ({ showMessage: jest.fn() }));

describe('deleteAccountSheet dismissal', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
  });

  afterEach(() => {
    mock.restore();
  });

  function goToConfirm(onDismiss: () => void) {
    render(<DeleteAccountSheet onDismiss={onDismiss} />);
    fireEvent.press(screen.getByTestId('delete-account-continue'));
  }

  function mockBackHandler() {
    const handlers = new Set<() => boolean | null | undefined>();
    const spy = jest.spyOn(BackHandler, 'addEventListener').mockImplementation((_, handler) => {
      handlers.add(handler);
      return { remove: () => handlers.delete(handler) };
    });
    const press = () => act(() => {
      [...handlers].reverse().some(handler => handler());
    });
    return { press, restore: () => spy.mockRestore() };
  }

  it.each(['explain', 'confirm'])('closes without deleting when Cancel is pressed at the %s step', (step) => {
    const onDismiss = jest.fn();
    if (step === 'confirm')
      goToConfirm(onDismiss);
    else
      render(<DeleteAccountSheet onDismiss={onDismiss} />);
    fireEvent.press(screen.getByTestId('delete-account-cancel'));
    expect(onDismiss).toHaveBeenCalled();
    expect(mock.history.delete).toHaveLength(0);
  });

  it.each(['explain', 'confirm'])('closes without deleting when Back is pressed at the %s step', (step) => {
    const back = mockBackHandler();
    const onDismiss = jest.fn();
    if (step === 'confirm')
      goToConfirm(onDismiss);
    else
      render(<DeleteAccountSheet onDismiss={onDismiss} />);
    back.press();
    expect(onDismiss).toHaveBeenCalled();
    expect(mock.history.delete).toHaveLength(0);
    back.restore();
  });

  it('shows Deleting… and disables controls while the request is pending', async () => {
    let finish: (value: [number]) => void = () => {};
    mock.onDelete('/users/me').reply(() => new Promise((resolve) => {
      finish = resolve;
    }));
    const back = mockBackHandler();
    const onDismiss = jest.fn();
    goToConfirm(onDismiss);
    fireEvent.changeText(screen.getByTestId('delete-account-input'), 'DELETE');
    fireEvent.press(screen.getByTestId('delete-account-confirm'));
    await waitFor(() => expect(screen.getByTestId('delete-account-confirm')).toHaveTextContent('Deleting…'));
    expect(screen.getByTestId('delete-account-confirm')).toBeDisabled();
    expect(screen.getByTestId('delete-account-cancel')).toBeDisabled();
    expect(screen.getByTestId('delete-account-input').props.editable).toBe(false);
    back.press();
    expect(onDismiss).not.toHaveBeenCalled();
    back.restore();
    await act(async () => {
      finish([500]);
    });
  });
});
