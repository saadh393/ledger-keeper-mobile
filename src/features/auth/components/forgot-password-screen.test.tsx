import MockAdapter from 'axios-mock-adapter';
import * as React from 'react';
import { ForgotPasswordScreen } from '@/features/auth/components/forgot-password-screen';
import { apiClient } from '@/lib/api/client';
import { act, fireEvent, render, screen, waitFor } from '@/lib/test-utils';

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn(), replace: jest.fn() }),
  useLocalSearchParams: () => ({ email: 'rahim@example.com' }),
}));

describe('forgotPasswordScreen', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
  });

  afterEach(() => {
    mock.restore();
    jest.useRealTimers();
  });

  it('prefills the email and shows the neutral message after sending', async () => {
    mock.onPost('/auth/request-password-reset').reply(200, { status: true });
    render(<ForgotPasswordScreen />);
    expect(screen.getByTestId('forgot-email-input')).toHaveDisplayValue('rahim@example.com');
    fireEvent.press(screen.getByTestId('forgot-submit'));
    expect(await screen.findByText('If an account exists for this email, we sent a reset link.')).toBeOnTheScreen();
    expect(JSON.parse(mock.history.post[0].data)).toEqual(expect.objectContaining({ email: 'rahim@example.com' }));
  });

  it('sends nothing for an invalid email', async () => {
    render(<ForgotPasswordScreen />);
    fireEvent.changeText(screen.getByTestId('forgot-email-input'), 'not-an-email');
    fireEvent.press(screen.getByTestId('forgot-submit'));
    expect(await screen.findByText('Please enter a valid email address')).toBeOnTheScreen();
    expect(mock.history.post).toHaveLength(0);
  });

  it('disables sending for 60 seconds after a send', async () => {
    jest.useFakeTimers();
    mock.onPost('/auth/request-password-reset').reply(200, { status: true });
    render(<ForgotPasswordScreen />);
    fireEvent.press(screen.getByTestId('forgot-submit'));
    await waitFor(() => expect(screen.getByTestId('forgot-submit')).toBeDisabled());
    expect(screen.getByText('Send again in 60s')).toBeOnTheScreen();
    await act(async () => {
      await jest.advanceTimersByTimeAsync(61_000);
    });
    expect(screen.getByTestId('forgot-submit')).toBeEnabled();
  });

  it('keeps the email and shows an error when the server fails', async () => {
    mock.onPost('/auth/request-password-reset').reply(500);
    render(<ForgotPasswordScreen />);
    fireEvent.press(screen.getByTestId('forgot-submit'));
    expect(await screen.findByTestId('forgot-error')).toBeOnTheScreen();
    expect(screen.getByTestId('forgot-email-input')).toHaveDisplayValue('rahim@example.com');
  });
});
