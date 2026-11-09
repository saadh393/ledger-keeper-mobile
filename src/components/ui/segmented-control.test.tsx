import * as React from 'react';
import { useReducedMotion, withTiming } from 'react-native-reanimated';

import { SegmentedControl } from '@/components/ui/segmented-control';
import { cleanup, fireEvent, render, screen, setup } from '@/lib/test-utils';

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

describe('segmentedControl rendering and track', () => {
  it('renders pill track in paper-200 with 2 to 4 segments', () => {
    const { rerender } = render(
      <SegmentedControl
        options={['Income', 'Expense']}
        value="Income"
        onChange={jest.fn()}
        testID="seg-2"
      />,
    );
    expect(screen.getByTestId('seg-2-track')).toBeOnTheScreen();
    expect(screen.getByText('Income')).toBeOnTheScreen();
    expect(screen.getByText('Expense')).toBeOnTheScreen();

    rerender(
      <SegmentedControl
        options={['All', 'Income', 'Expense']}
        value="All"
        onChange={jest.fn()}
        testID="seg-3"
      />,
    );
    expect(screen.getByText('All')).toBeOnTheScreen();
    expect(screen.getByText('Income')).toBeOnTheScreen();
    expect(screen.getByText('Expense')).toBeOnTheScreen();

    rerender(
      <SegmentedControl
        options={['Day', 'Week', 'Month', 'Year']}
        value="Month"
        onChange={jest.fn()}
        testID="seg-4"
      />,
    );
    expect(screen.getByText('Day')).toBeOnTheScreen();
    expect(screen.getByText('Week')).toBeOnTheScreen();
    expect(screen.getByText('Month')).toBeOnTheScreen();
    expect(screen.getByText('Year')).toBeOnTheScreen();
  });

  it('renders active segment in surface with elevation 1 and 13/500 text-label', () => {
    render(
      <SegmentedControl
        options={['All', 'Income', 'Expense']}
        value="Income"
        onChange={jest.fn()}
        testID="filter"
      />,
    );

    const activeSegment = screen.getByTestId('filter-segment-Income');
    expect(activeSegment.props.className).toContain('bg-surface');

    const flattened = Array.isArray(activeSegment.props.style)
      ? Object.assign({}, ...activeSegment.props.style)
      : activeSegment.props.style;
    expect(flattened?.elevation).toBe(1);

    const activeLabel = screen.getByText('Income');
    expect(activeLabel.props.className).toContain('text-label');
    expect(activeLabel.props.className).toContain('text-ink-900');

    const inactiveLabel = screen.getByText('All');
    expect(inactiveLabel.props.className).toContain('text-label');
    expect(inactiveLabel.props.className).toContain('text-ink-500');
  });

  it('truncates long labels with … instead of overflowing', () => {
    render(
      <SegmentedControl
        options={['Short', 'A very very long descriptive label that exceeds width']}
        value="Short"
        onChange={jest.fn()}
      />,
    );

    const longLabel = screen.getByText(
      'A very very long descriptive label that exceeds width',
    );
    expect(longLabel.props.numberOfLines).toBe(1);
    expect(longLabel.props.ellipsizeMode).toBe('tail');
  });
});

describe('segmentedControl accessibility', () => {
  it('announces each segment as a tab with its selected state for screen readers', () => {
    render(
      <SegmentedControl
        options={['First', 'Second']}
        value="First"
        onChange={jest.fn()}
        testID="tabs"
      />,
    );

    const firstTab = screen.getByTestId('tabs-segment-First');
    const secondTab = screen.getByTestId('tabs-segment-Second');

    expect(firstTab.props.accessibilityRole).toBe('tab');
    expect(firstTab.props.accessibilityState).toEqual({
      selected: true,
      disabled: false,
    });

    expect(secondTab.props.accessibilityRole).toBe('tab');
    expect(secondTab.props.accessibilityState).toEqual({
      selected: false,
      disabled: false,
    });
  });

  it('ensures each segment has a touch target of at least 44 high', () => {
    render(
      <SegmentedControl
        options={['Tab 1', 'Tab 2']}
        value="Tab 1"
        onChange={jest.fn()}
        testID="touch"
      />,
    );

    const tab1 = screen.getByTestId('touch-segment-Tab 1');
    const tab2 = screen.getByTestId('touch-segment-Tab 2');

    expect(tab1.props.className).toContain('min-h-[44px]');
    expect(tab2.props.className).toContain('min-h-[44px]');
  });
});

describe('segmentedControl interaction', () => {
  it('calls onChange once when tapping an inactive segment', async () => {
    const onChange = jest.fn();
    const { user } = setup(
      <SegmentedControl
        options={['First', 'Second', 'Third']}
        value="First"
        onChange={onChange}
        testID="control"
      />,
    );

    const secondSegment = screen.getByTestId('control-segment-Second');
    await user.press(secondSegment);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('Second');
  });

  it('does nothing when tapping the currently active segment', async () => {
    const onChange = jest.fn();
    const { user } = setup(
      <SegmentedControl
        options={['First', 'Second']}
        value="First"
        onChange={onChange}
        testID="control"
      />,
    );

    const activeSegment = screen.getByTestId('control-segment-First');
    await user.press(activeSegment);

    expect(onChange).not.toHaveBeenCalled();
  });

  it('supports options as objects with custom labels and values', async () => {
    const onChange = jest.fn();
    const options = [
      { label: 'All Tx', value: 'all', testID: 'opt-all' },
      { label: 'Pending', value: 'pending', testID: 'opt-pending' },
    ];

    const { user } = setup(
      <SegmentedControl
        options={options}
        value="all"
        onChange={onChange}
      />,
    );

    expect(screen.getByTestId('opt-all')).toBeOnTheScreen();
    const pending = screen.getByTestId('opt-pending');
    await user.press(pending);

    expect(onChange).toHaveBeenCalledWith('pending');
  });

  it('does not trigger onChange when disabled', async () => {
    const onChange = jest.fn();
    const { user } = setup(
      <SegmentedControl
        options={['One', 'Two']}
        value="One"
        onChange={onChange}
        disabled
        testID="disabled-ctrl"
      />,
    );

    const segmentTwo = screen.getByTestId('disabled-ctrl-segment-Two');
    await user.press(segmentTwo);

    expect(onChange).not.toHaveBeenCalled();
    expect(segmentTwo.props.accessibilityState.disabled).toBe(true);
  });
});

describe('segmentedControl animation and reduced motion', () => {
  it('animates indicator with 120ms on layout and respects reduced motion', () => {
    const { rerender } = render(
      <SegmentedControl
        options={['A', 'B']}
        value="A"
        onChange={jest.fn()}
        testID="anim-ctrl"
      />,
    );

    const track = screen.getByTestId('anim-ctrl-track');
    fireEvent(track, 'layout', {
      nativeEvent: { layout: { width: 300, height: 48, x: 0, y: 0 } },
    });

    expect(screen.getByTestId('anim-ctrl-active-indicator')).toBeOnTheScreen();

    rerender(
      <SegmentedControl
        options={['A', 'B']}
        value="B"
        onChange={jest.fn()}
        testID="anim-ctrl"
      />,
    );
    expect(withTiming).toHaveBeenCalledWith(
      expect.any(Number),
      expect.objectContaining({ duration: 120 }),
    );

    jest.mocked(useReducedMotion).mockReturnValue(true);
    rerender(
      <SegmentedControl
        options={['A', 'B']}
        value="A"
        onChange={jest.fn()}
        testID="anim-ctrl"
      />,
    );
  });
});

describe('segmentedControl drawing order', () => {
  it('keeps the raised pill in an unelevated layer drawn before the labels', () => {
    render(
      <SegmentedControl
        options={['All', 'Income', 'Expense']}
        value="Expense"
        onChange={jest.fn()}
        testID="order"
      />,
    );

    fireEvent(screen.getByTestId('order-track'), 'layout', {
      nativeEvent: { layout: { width: 300, height: 48, x: 0, y: 0 } },
    });

    const layer = screen.getByTestId('order-indicator-layer');
    const pill = screen.getByTestId('order-active-indicator');

    expect(layer.props.style?.elevation).toBeUndefined();
    expect(layer).toContainElement(pill);
    expect(layer).not.toContainElement(screen.getByText('Expense'));

    const pillStyle = Object.assign({}, ...[pill.props.style].flat(Infinity).filter(Boolean));
    expect(pillStyle.elevation).toBe(1);
  });
});
