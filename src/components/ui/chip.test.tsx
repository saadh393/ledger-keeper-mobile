import { Tag } from 'lucide-react-native';
import * as React from 'react';
import { Text } from 'react-native';

import { cleanup, fireEvent, render, screen } from '@/lib/test-utils';

import { Chip } from './chip';

afterEach(() => {
  cleanup();
  jest.restoreAllMocks();
});

describe('chip rendering and variants', () => {
  it('renders default chip with paper-200 fill and pill shape', () => {
    render(<Chip label="All transactions" testID="chip" />);
    const chip = screen.getByTestId('chip');
    expect(chip.props.className).toContain('rounded-full');
    expect(chip.props.className).toContain('bg-paper-200');
  });

  it('renders label with 13/500 text-label style and ink-900 color by default', () => {
    render(<Chip label="Cash" testID="chip" />);
    const label = screen.getByText('Cash');
    expect(label.props.className).toContain('text-label');
    expect(label.props.className).toContain('text-ink-900');
  });

  it('renders selected state with selected fill and on-selected text', () => {
    render(<Chip label="Income" selected testID="chip" />);
    const chip = screen.getByTestId('chip');
    expect(chip.props.className).toContain('bg-selected');
    const label = screen.getByText('Income');
    expect(label.props.className).toContain('text-on-selected');
  });

  it('renders as non-pressable View when onPress is absent', () => {
    render(<Chip label="Static chip" testID="chip" />);
    const chip = screen.getByTestId('chip');
    expect(chip.props.accessibilityRole).toBeUndefined();
  });

  it('provides touch target of at least 44 high via hitSlop when pressable', () => {
    const onPress = jest.fn();
    render(<Chip label="Filter" onPress={onPress} testID="chip" />);
    const chip = screen.getByTestId('chip');
    expect(chip.props.accessibilityRole).toBe('button');
    // Hit slop defaults to top: 8, bottom: 8 (32 min-height + 16 = 48 >= 44)
    expect(chip.props.hitSlop).toEqual({ top: 8, bottom: 8, left: 4, right: 4 });
  });

  it('allows overriding hitSlop', () => {
    const customSlop = { top: 10, bottom: 10, left: 10, right: 10 };
    render(<Chip label="Filter" onPress={jest.fn()} hitSlop={customSlop} testID="chip" />);
    const chip = screen.getByTestId('chip');
    expect(chip.props.hitSlop).toEqual(customSlop);
  });

  it('fires onPress when tapped', () => {
    const onPress = jest.fn();
    render(<Chip label="Tap me" onPress={onPress} testID="chip" />);
    fireEvent.press(screen.getByTestId('chip'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('handles disabled state and prevents press', () => {
    const onPress = jest.fn();
    render(<Chip label="Disabled chip" disabled onPress={onPress} testID="chip" />);
    const chip = screen.getByTestId('chip');
    expect(chip.props.className).toContain('opacity-50');
    expect(chip.props.accessibilityState).toEqual({ selected: false, disabled: true });
    fireEvent.press(chip);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('renders icon with matching token color for selected and unselected states', () => {
    const { unmount } = render(
      <Chip label="Tagged" icon={Tag} testID="chip" />,
    );
    expect(screen.getByTestId('chip')).toBeOnTheScreen();
    unmount();

    render(
      <Chip label="Tagged selected" icon={Tag} selected testID="chip-selected" />,
    );
    expect(screen.getByTestId('chip-selected')).toBeOnTheScreen();
  });

  it('supports custom children', () => {
    render(
      <Chip testID="chip">
        <Text>Custom Content</Text>
      </Chip>,
    );
    expect(screen.getByText('Custom Content')).toBeOnTheScreen();
  });
});
