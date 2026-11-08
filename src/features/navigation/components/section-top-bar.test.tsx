import * as React from 'react';
import { View } from 'react-native';
import { SectionTopBar } from '@/features/navigation/components/section-top-bar';
import i18n from '@/lib/i18n';
import { act, fireEvent, render, screen } from '@/lib/test-utils';

describe('sectionTopBar', () => {
  afterEach(async () => {
    await act(() => i18n.changeLanguage('en'));
  });

  it('renders title and menu button labelled "Open menu" for screen readers', () => {
    const onOpenMenu = jest.fn();
    render(<SectionTopBar title="Ledger" onOpenMenu={onOpenMenu} />);

    expect(screen.getByTestId('top-bar-title')).toHaveTextContent('Ledger');
    const menuButton = screen.getByTestId('top-bar-menu-button');
    expect(menuButton).toBeOnTheScreen();
    expect(menuButton.props.accessibilityLabel).toBe('Open menu');
  });

  it('translates menu button label to Bangla', async () => {
    await act(() => i18n.changeLanguage('bn'));
    const onOpenMenu = jest.fn();
    render(<SectionTopBar title="লেজার" onOpenMenu={onOpenMenu} />);

    const menuButton = screen.getByTestId('top-bar-menu-button');
    expect(menuButton.props.accessibilityLabel).toBe('মেনু খুলুন');
  });

  it('calls onOpenMenu when menu button is pressed', () => {
    const onOpenMenu = jest.fn();
    render(<SectionTopBar title="Loans" onOpenMenu={onOpenMenu} />);

    const menuButton = screen.getByTestId('top-bar-menu-button');
    fireEvent.press(menuButton);

    expect(onOpenMenu).toHaveBeenCalledTimes(1);
  });

  it('renders optional right element when provided', () => {
    const onOpenMenu = jest.fn();
    render(
      <SectionTopBar
        title="Ledger"
        onOpenMenu={onOpenMenu}
        rightElement={<View testID="custom-right-element" />}
      />,
    );

    expect(screen.getByTestId('custom-right-element')).toBeOnTheScreen();
  });
});
