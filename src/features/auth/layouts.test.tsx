import { render } from '@testing-library/react-native';
import * as React from 'react';

import AppLayout from '@/app/(app)/_layout';
import AuthLayout from '@/app/(auth)/_layout';
import { _resetAuthStore, useAuthStore } from '@/features/auth/use-auth-store';

const mockRedirect = jest.fn();

jest.mock('expo-router', () => {
  const React = require('react');
  return {
    Redirect: (props: any) => {
      mockRedirect(props);
      return null;
    },
    Stack: (props: any) => React.createElement('Stack', props),
  };
});

describe('appLayout and AuthLayout route guards', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    _resetAuthStore();
  });

  describe('appLayout', () => {
    it('renders null when auth status is idle', () => {
      useAuthStore.setState({ status: 'idle' });
      const { toJSON } = render(<AppLayout />);
      expect(toJSON()).toBeNull();
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it('redirects to /auth when auth status is signedOut', () => {
      useAuthStore.setState({ status: 'signedOut' });
      render(<AppLayout />);
      expect(mockRedirect).toHaveBeenCalledWith({ href: '/auth' });
    });

    it('renders stack when auth status is signedIn', () => {
      useAuthStore.setState({ status: 'signedIn' });
      const { toJSON } = render(<AppLayout />);
      expect(toJSON()).not.toBeNull();
      expect(mockRedirect).not.toHaveBeenCalled();
    });
  });

  describe('authLayout', () => {
    it('renders null when auth status is idle', () => {
      useAuthStore.setState({ status: 'idle' });
      const { toJSON } = render(<AuthLayout />);
      expect(toJSON()).toBeNull();
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it('redirects to / when auth status is signedIn', () => {
      useAuthStore.setState({ status: 'signedIn' });
      render(<AuthLayout />);
      expect(mockRedirect).toHaveBeenCalledWith({ href: '/' });
    });

    it('renders stack when auth status is signedOut', () => {
      useAuthStore.setState({ status: 'signedOut' });
      const { toJSON } = render(<AuthLayout />);
      expect(toJSON()).not.toBeNull();
      expect(mockRedirect).not.toHaveBeenCalled();
    });
  });
});
