/* eslint-disable max-lines-per-function */
import type { SocialSignInResponse } from '@/features/auth/api/auth-client';
import { onlineManager } from '@tanstack/react-query';
import * as React from 'react';

import { authClient } from '@/features/auth/api/auth-client';
import { AuthScreen } from '@/features/auth/auth-screen';
import { _resetAuthStore, useAuthStore } from '@/features/auth/use-auth-store';
import { ApiError } from '@/lib/api/errors';
import i18n from '@/lib/i18n';
import { cleanup, fireEvent, render, screen, waitFor } from '@/lib/test-utils';

const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    replace: mockReplace,
    push: jest.fn(),
    back: jest.fn(),
  })),
}));

describe('authScreen and EmailPasswordForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    _resetAuthStore();
    useAuthStore.setState({ status: 'signedOut' });
    jest.spyOn(onlineManager, 'isOnline').mockReturnValue(true);
  });

  describe('screen rendering & elements', () => {
    it('shows logo, headline, Google button, divider, email field, password field, and primary button', () => {
      render(<AuthScreen />);

      expect(screen.getByTestId('auth-screen')).toBeOnTheScreen();
      expect(screen.getByTestId('auth-scroll-view')).toBeOnTheScreen();
      expect(screen.getByTestId('auth-logo')).toBeOnTheScreen();
      expect(screen.getByTestId('auth-headline')).toHaveTextContent('Your money, in plain words.');

      // Google button and divider above email form
      expect(screen.getByTestId('google-sign-in-button')).toBeOnTheScreen();
      expect(screen.getByText('Continue with Google')).toBeOnTheScreen();
      expect(screen.getByTestId('google-icon')).toBeOnTheScreen();
      expect(screen.getByTestId('auth-divider')).toBeOnTheScreen();
      expect(screen.getByTestId('auth-divider-text')).toHaveTextContent('or');

      // Email form elements
      expect(screen.getByTestId('email-input')).toBeOnTheScreen();
      expect(screen.getByTestId('password-input')).toBeOnTheScreen();
      expect(screen.getByTestId('auth-submit-button')).toBeOnTheScreen();
      expect(screen.getByText('Sign in')).toBeOnTheScreen();
    });

    it('shows localized headline, Google button, and divider in Bangla', async () => {
      await i18n.changeLanguage('bn');
      try {
        render(<AuthScreen />);
        expect(screen.getByTestId('auth-headline')).toHaveTextContent('আপনার টাকা, সহজ ভাষায়।');
        expect(screen.getByText('গুগল দিয়ে চালিয়ে যান')).toBeOnTheScreen();
        expect(screen.getByTestId('auth-divider-text')).toHaveTextContent('অথবা');
      }
      finally {
        cleanup();
        await i18n.changeLanguage('en');
      }
    });

    it('uses email keyboard, no auto-capitalisation, and autofill hints', () => {
      render(<AuthScreen />);

      const emailInput = screen.getByTestId('email-input');
      expect(emailInput.props.keyboardType).toBe('email-address');
      expect(emailInput.props.autoCapitalize).toBe('none');
      expect(emailInput.props.autoCorrect).toBe(false);
      expect(emailInput.props.autoComplete).toBe('email');

      const passwordInput = screen.getByTestId('password-input');
      expect(passwordInput.props.autoComplete).toBe('current-password');
      expect(passwordInput.props.secureTextEntry).toBe(true);
    });

    it('toggles password visibility with screen-reader label', () => {
      render(<AuthScreen />);

      const passwordInput = screen.getByTestId('password-input');
      const toggleButton = screen.getByTestId('toggle-password-visibility');

      expect(passwordInput.props.secureTextEntry).toBe(true);
      expect(toggleButton.props.accessibilityLabel).toBe('Show password');

      fireEvent.press(toggleButton);

      expect(passwordInput.props.secureTextEntry).toBe(false);
      expect(toggleButton.props.accessibilityLabel).toBe('Hide password');

      fireEvent.press(toggleButton);

      expect(passwordInput.props.secureTextEntry).toBe(true);
      expect(toggleButton.props.accessibilityLabel).toBe('Show password');
    });
  });

  describe('google sign-in', () => {
    it('signs in with Google successfully, stores bearer token, and navigates away', async () => {
      const socialSpy = jest.spyOn(authClient.signIn, 'social').mockResolvedValue({
        token: 'google-bearer-token-123',
        canceled: false,
      });

      render(<AuthScreen />);

      const googleButton = screen.getByTestId('google-sign-in-button');
      fireEvent.press(googleButton);

      await waitFor(() => {
        expect(socialSpy).toHaveBeenCalledWith({
          provider: 'google',
          callbackURL: expect.stringMatching(/ledgerkeeper.*:\/\//),
        });
        expect(useAuthStore.getState().status).toBe('signedIn');
        expect(mockReplace).toHaveBeenCalledWith('/');
      });

      expect(screen.queryByTestId('google-auth-error')).toBeNull();
      socialSpy.mockRestore();
    });

    it('closing the browser or pressing back returns to auth screen with no error and enables button again', async () => {
      const socialSpy = jest.spyOn(authClient.signIn, 'social').mockResolvedValue({
        token: null,
        canceled: true,
      });

      render(<AuthScreen />);

      const googleButton = screen.getByTestId('google-sign-in-button');
      fireEvent.press(googleButton);

      await waitFor(() => {
        expect(socialSpy).toHaveBeenCalledTimes(1);
      });

      // No error shown
      expect(screen.queryByTestId('google-auth-error')).toBeNull();
      // Not signed in
      expect(useAuthStore.getState().status).toBe('signedOut');
      expect(mockReplace).not.toHaveBeenCalled();

      // Button is enabled again
      await waitFor(() => {
        expect(screen.getByText('Continue with Google')).toBeOnTheScreen();
        expect(googleButton.props.accessibilityState.disabled).toBe(false);
      });

      socialSpy.mockRestore();
    });

    it('shows error when Google sign-in fails on server or redirect, and enables button again', async () => {
      const socialSpy = jest.spyOn(authClient.signIn, 'social').mockRejectedValue(
        new Error('Server failed to authenticate with Google'),
      );

      render(<AuthScreen />);

      const googleButton = screen.getByTestId('google-sign-in-button');
      fireEvent.press(googleButton);

      await waitFor(() => {
        expect(screen.getByTestId('google-auth-error')).toHaveTextContent(
          'Couldn\'t sign in with Google. Try again.',
        );
      });

      expect(useAuthStore.getState().status).toBe('signedOut');
      expect(mockReplace).not.toHaveBeenCalled();
      expect(googleButton.props.accessibilityState.disabled).toBe(false);

      socialSpy.mockRestore();
    });

    it('shows offline error when tapping Google button while offline and opens no browser', async () => {
      jest.spyOn(onlineManager, 'isOnline').mockReturnValue(false);
      const socialSpy = jest.spyOn(authClient.signIn, 'social');

      render(<AuthScreen />);

      const googleButton = screen.getByTestId('google-sign-in-button');
      fireEvent.press(googleButton);

      await waitFor(() => {
        expect(screen.getByTestId('google-auth-error')).toHaveTextContent(
          'You\'re offline. Check your connection and try again.',
        );
      });

      expect(socialSpy).not.toHaveBeenCalled();
      expect(useAuthStore.getState().status).toBe('signedOut');
      expect(mockReplace).not.toHaveBeenCalled();
      expect(googleButton.props.accessibilityState.disabled).toBe(false);

      socialSpy.mockRestore();
    });

    it('shows pending state and disables email form while waiting for browser result, ignoring second tap', async () => {
      let resolvePromise: (val: SocialSignInResponse) => void = () => {};
      const pendingPromise = new Promise<SocialSignInResponse>((resolve) => {
        resolvePromise = resolve;
      });

      const socialSpy = jest.spyOn(authClient.signIn, 'social').mockImplementation(() => pendingPromise);

      render(<AuthScreen />);

      const googleButton = screen.getByTestId('google-sign-in-button');
      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      const emailSubmitButton = screen.getByTestId('auth-submit-button');

      fireEvent.press(googleButton);

      // While waiting for Google sign-in result:
      await waitFor(() => {
        expect(screen.getByText('Continue with Google…')).toBeOnTheScreen();
        expect(screen.getByTestId('google-button-loading')).toBeOnTheScreen();
      });

      // Email form should be disabled
      expect(emailInput.props.editable).toBe(false);
      expect(passwordInput.props.editable).toBe(false);
      expect(emailSubmitButton.props.accessibilityState.disabled).toBe(true);

      // Second press on Google button should be ignored
      fireEvent.press(googleButton);
      expect(socialSpy).toHaveBeenCalledTimes(1);

      // Resolve Google sign-in
      resolvePromise({ token: 'resolved-token', canceled: false });

      await waitFor(() => {
        expect(useAuthStore.getState().status).toBe('signedIn');
        expect(mockReplace).toHaveBeenCalledWith('/');
      });

      socialSpy.mockRestore();
    });

    it('disables Google button while email form is submitting', async () => {
      let resolveEmailPromise: (token: string) => void = () => {};
      const pendingEmail = new Promise<string>((resolve) => {
        resolveEmailPromise = resolve;
      });

      const signInSpy = jest.spyOn(authClient, 'signInWithEmail').mockImplementation(() => pendingEmail);
      const socialSpy = jest.spyOn(authClient.signIn, 'social');

      render(<AuthScreen />);

      fireEvent.changeText(screen.getByTestId('email-input'), 'user@example.com');
      fireEvent.changeText(screen.getByTestId('password-input'), 'password123');

      const emailSubmit = screen.getByTestId('auth-submit-button');
      fireEvent.press(emailSubmit);

      await waitFor(() => {
        expect(screen.getByText('Signing in…')).toBeOnTheScreen();
      });

      const googleButton = screen.getByTestId('google-sign-in-button');
      expect(googleButton.props.accessibilityState.disabled).toBe(true);

      fireEvent.press(googleButton);
      expect(socialSpy).not.toHaveBeenCalled();

      resolveEmailPromise('token-email');
      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/');
      });

      signInSpy.mockRestore();
      socialSpy.mockRestore();
    });
  });

  describe('mode switching', () => {
    it('switches to Create account, adds Full name field, and updates autofill hint', () => {
      render(<AuthScreen />);

      expect(screen.queryByTestId('name-input')).toBeNull();

      const switchLink = screen.getByTestId('toggle-auth-mode');
      fireEvent.press(switchLink);

      expect(screen.getByTestId('name-input')).toBeOnTheScreen();
      expect(screen.getByText('Create account')).toBeOnTheScreen();
      expect(screen.getByTestId('password-input').props.autoComplete).toBe('new-password');

      fireEvent.press(screen.getByTestId('toggle-auth-mode'));
      expect(screen.queryByTestId('name-input')).toBeNull();
      expect(screen.getByText('Sign in')).toBeOnTheScreen();
    });

    it('clears field errors but keeps entered email on mode switch', async () => {
      render(<AuthScreen />);

      const emailInput = screen.getByTestId('email-input');
      fireEvent.changeText(emailInput, 'user@example.com');

      // Trigger validation error on password by submitting
      const submitButton = screen.getByTestId('auth-submit-button');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('password-input-error')).toBeOnTheScreen();
      });

      // Switch mode
      const switchLink = screen.getByTestId('toggle-auth-mode');
      fireEvent.press(switchLink);

      // Email should be preserved
      await waitFor(() => {
        expect(screen.getByTestId('email-input').props.value).toBe('user@example.com');
      });
      // Password error should be cleared
      expect(screen.queryByTestId('password-input-error')).toBeNull();
      // Form error should be cleared
      expect(screen.queryByTestId('auth-form-error')).toBeNull();
    });
  });

  describe('validation before submit', () => {
    it('shows errors for empty email and empty password and sends nothing', async () => {
      const signInSpy = jest.spyOn(authClient, 'signInWithEmail');
      render(<AuthScreen />);

      const submitButton = screen.getByTestId('auth-submit-button');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('email-input-error')).toHaveTextContent('Email is required');
        expect(screen.getByTestId('password-input-error')).toHaveTextContent('Password is required');
      });
      expect(signInSpy).not.toHaveBeenCalled();
      signInSpy.mockRestore();
    });

    it('shows error for invalid email and sends nothing', async () => {
      const signInSpy = jest.spyOn(authClient, 'signInWithEmail');
      render(<AuthScreen />);

      fireEvent.changeText(screen.getByTestId('email-input'), 'invalid-email');
      fireEvent.changeText(screen.getByTestId('password-input'), 'validPass123');

      fireEvent.press(screen.getByTestId('auth-submit-button'));

      await waitFor(() => {
        expect(screen.getByTestId('email-input-error')).toHaveTextContent('Please enter a valid email address');
      });
      expect(signInSpy).not.toHaveBeenCalled();
      signInSpy.mockRestore();
    });

    it('on Create account shows error for empty name (after trim) and short password', async () => {
      const signUpSpy = jest.spyOn(authClient, 'signUpWithEmail');
      render(<AuthScreen />);

      // Switch to Create account
      fireEvent.press(screen.getByTestId('toggle-auth-mode'));

      fireEvent.changeText(screen.getByTestId('name-input'), '   ');
      fireEvent.changeText(screen.getByTestId('email-input'), 'test@example.com');
      fireEvent.changeText(screen.getByTestId('password-input'), 'short');

      fireEvent.press(screen.getByTestId('auth-submit-button'));

      await waitFor(() => {
        expect(screen.getByTestId('name-input-error')).toHaveTextContent('Name is required');
        expect(screen.getByTestId('password-input-error')).toHaveTextContent('Password must be at least 8 characters');
      });
      expect(signUpSpy).not.toHaveBeenCalled();
      signUpSpy.mockRestore();
    });
  });

  describe('submit handling & responses', () => {
    it('signs in successfully, stores bearer token, and navigates away', async () => {
      const signInSpy = jest.spyOn(authClient, 'signInWithEmail').mockResolvedValue('test-bearer-token-123');

      render(<AuthScreen />);

      fireEvent.changeText(screen.getByTestId('email-input'), '  user@example.com  ');
      fireEvent.changeText(screen.getByTestId('password-input'), 'password123');

      fireEvent.press(screen.getByTestId('auth-submit-button'));

      await waitFor(() => {
        expect(signInSpy).toHaveBeenCalledWith('  user@example.com  ', 'password123');
        expect(useAuthStore.getState().status).toBe('signedIn');
        expect(mockReplace).toHaveBeenCalledWith('/');
      });

      signInSpy.mockRestore();
    });

    it('creates account successfully, stores token, and navigates away', async () => {
      const signUpSpy = jest.spyOn(authClient, 'signUpWithEmail').mockResolvedValue('signup-token-456');

      render(<AuthScreen />);
      fireEvent.press(screen.getByTestId('toggle-auth-mode'));

      fireEvent.changeText(screen.getByTestId('name-input'), '  Jane Doe  ');
      fireEvent.changeText(screen.getByTestId('email-input'), '  jane@example.com  ');
      fireEvent.changeText(screen.getByTestId('password-input'), 'password123');

      fireEvent.press(screen.getByTestId('auth-submit-button'));

      await waitFor(() => {
        expect(signUpSpy).toHaveBeenCalledWith('  Jane Doe  ', '  jane@example.com  ', 'password123');
        expect(useAuthStore.getState().status).toBe('signedIn');
        expect(mockReplace).toHaveBeenCalledWith('/');
      });

      signUpSpy.mockRestore();
    });

    it('shows wrong email or password error above button, preserves email, and clears password', async () => {
      const signInSpy = jest.spyOn(authClient, 'signInWithEmail').mockRejectedValue(
        new ApiError({ kind: 'unauthorized', status: 401, message: 'Invalid email or password' }),
      );

      render(<AuthScreen />);

      fireEvent.changeText(screen.getByTestId('email-input'), 'user@example.com');
      fireEvent.changeText(screen.getByTestId('password-input'), 'wrongpass');

      fireEvent.press(screen.getByTestId('auth-submit-button'));

      await waitFor(() => {
        expect(screen.getByTestId('auth-form-error')).toHaveTextContent('Email or password is incorrect');
        expect(screen.getByTestId('email-input').props.value).toBe('user@example.com');
        expect(screen.getByTestId('password-input').props.value).toBe('');
      });

      signInSpy.mockRestore();
    });

    it('shows server message when creating account with already existing email and keeps form filled', async () => {
      const signUpSpy = jest.spyOn(authClient, 'signUpWithEmail').mockRejectedValue(
        new ApiError({ kind: 'conflict', status: 409, message: 'User already exists. Use another email.' }),
      );

      render(<AuthScreen />);
      fireEvent.press(screen.getByTestId('toggle-auth-mode'));

      fireEvent.changeText(screen.getByTestId('name-input'), 'Jane Doe');
      fireEvent.changeText(screen.getByTestId('email-input'), 'existing@example.com');
      fireEvent.changeText(screen.getByTestId('password-input'), 'password123');

      fireEvent.press(screen.getByTestId('auth-submit-button'));

      await waitFor(() => {
        expect(screen.getByTestId('auth-form-error')).toHaveTextContent('User already exists. Use another email.');
        expect(screen.getByTestId('name-input').props.value).toBe('Jane Doe');
        expect(screen.getByTestId('email-input').props.value).toBe('existing@example.com');
        expect(screen.getByTestId('password-input').props.value).toBe('password123');
      });

      signUpSpy.mockRestore();
    });

    it('shows offline message when network is unreachable and keeps form filled', async () => {
      const signInSpy = jest.spyOn(authClient, 'signInWithEmail').mockRejectedValue(
        new ApiError({ kind: 'offline', message: 'Network unreachable' }),
      );

      render(<AuthScreen />);

      fireEvent.changeText(screen.getByTestId('email-input'), 'user@example.com');
      fireEvent.changeText(screen.getByTestId('password-input'), 'password123');

      fireEvent.press(screen.getByTestId('auth-submit-button'));

      await waitFor(() => {
        expect(screen.getByTestId('auth-form-error')).toHaveTextContent(
          'You\'re offline. Check your connection and try again.',
        );
        expect(screen.getByTestId('email-input').props.value).toBe('user@example.com');
        expect(screen.getByTestId('password-input').props.value).toBe('password123');
      });

      signInSpy.mockRestore();
    });

    it('shows generic error on timeout or 5xx and keeps form filled', async () => {
      const signInSpy = jest.spyOn(authClient, 'signInWithEmail').mockRejectedValue(
        new ApiError({ kind: 'timeout', message: 'Connection timed out' }),
      );

      render(<AuthScreen />);

      fireEvent.changeText(screen.getByTestId('email-input'), 'user@example.com');
      fireEvent.changeText(screen.getByTestId('password-input'), 'password123');

      fireEvent.press(screen.getByTestId('auth-submit-button'));

      await waitFor(() => {
        expect(screen.getByTestId('auth-form-error')).toHaveTextContent('Something went wrong. Try again.');
        expect(screen.getByTestId('email-input').props.value).toBe('user@example.com');
        expect(screen.getByTestId('password-input').props.value).toBe('password123');
      });

      signInSpy.mockRestore();
    });

    it('disables fields and shows pending label while submitting, ignoring second tap', async () => {
      let resolvePromise: (token: string) => void = () => {};
      const pendingPromise = new Promise<string>((resolve) => {
        resolvePromise = resolve;
      });

      const signInSpy = jest.spyOn(authClient, 'signInWithEmail').mockImplementation(() => pendingPromise);

      render(<AuthScreen />);

      fireEvent.changeText(screen.getByTestId('email-input'), 'user@example.com');
      fireEvent.changeText(screen.getByTestId('password-input'), 'password123');

      const submitButton = screen.getByTestId('auth-submit-button');

      fireEvent.press(submitButton);

      // While submitting:
      await waitFor(() => {
        expect(screen.getByText('Signing in…')).toBeOnTheScreen();
      });
      expect(screen.getByTestId('email-input').props.editable).toBe(false);
      expect(screen.getByTestId('password-input').props.editable).toBe(false);

      // Second press should be ignored
      fireEvent.press(submitButton);
      expect(signInSpy).toHaveBeenCalledTimes(1);

      // Resolve the submission
      resolvePromise('token-done');

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/');
      });

      signInSpy.mockRestore();
    });
  });
});
