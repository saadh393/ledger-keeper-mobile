import * as React from 'react';
import { Linking } from 'react-native';
import { PrivacyPolicyLink } from '@/features/legal/components/privacy-policy-link';
import { fireEvent, render, screen } from '@/lib/test-utils';

let mockUrl: string | undefined;

jest.mock('@env', () => ({
  __esModule: true,
  default: {
    get EXPO_PUBLIC_PRIVACY_POLICY_URL() {
      return mockUrl;
    },
  },
}));

describe('privacyPolicyLink', () => {
  afterEach(() => {
    mockUrl = undefined;
  });

  it('opens the configured privacy policy', () => {
    mockUrl = 'https://example.com/privacy';
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    render(<PrivacyPolicyLink />);
    fireEvent.press(screen.getByText('Privacy policy'));
    expect(openURL).toHaveBeenCalledWith('https://example.com/privacy');
  });

  it('is hidden when no URL is configured', () => {
    render(<PrivacyPolicyLink />);
    expect(screen.queryByTestId('privacy-policy-link')).toBeNull();
  });
});
