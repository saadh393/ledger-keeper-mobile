import * as React from 'react';

import { cleanup, fireEvent, render, screen } from '@/lib/test-utils';

import { StatTile } from './stat-tile';

afterEach(() => {
  cleanup();
  jest.restoreAllMocks();
});

describe('statTile rendering and variants', () => {
  it('renders radius 20, surface-container fill, and label 13', () => {
    render(<StatTile label="Total income" value="৳12,000" testID="stat-tile" />);
    const tile = screen.getByTestId('stat-tile');
    expect(tile.props.className).toContain('rounded-[20px]');
    expect(tile.props.className).toContain('bg-surface-container');

    const label = screen.getByText('Total income');
    expect(label.props.className).toContain('text-label');
    expect(label.props.className).toContain('text-ink-500');
  });

  it('renders value in hero style with tabular figures', () => {
    render(<StatTile label="Income" value="৳25,000" />);
    const value = screen.getByTestId('stat-tile-value');
    expect(value.props.className).toContain('text-hero');
    expect(value.props.className).toContain('text-ink-900');
    expect(value.props.style).toEqual(
      expect.objectContaining({ fontVariant: ['tabular-nums'] }),
    );
  });

  it('applies valueClassName to the value', () => {
    render(<StatTile label="Net position" value="+ ৳1" valueClassName="text-forest-500" />);
    const value = screen.getByTestId('stat-tile-value');
    expect(value.props.className).toContain('text-forest-500');
    expect(value.props.className).not.toContain('text-ink-900');
  });

  it('renders income dot tone with bg-forest-500', () => {
    render(<StatTile label="Income" value="৳1" tone="income" />);
    expect(screen.getByTestId('stat-tile-dot', { includeHiddenElements: true }).props.className).toContain('bg-forest-500');
  });

  it('renders expense dot tone with bg-clay-500', () => {
    render(<StatTile label="Expense" value="৳1" tone="expense" />);
    expect(screen.getByTestId('stat-tile-dot', { includeHiddenElements: true }).props.className).toContain('bg-clay-500');
  });

  it('renders info dot tone with bg-link', () => {
    render(<StatTile label="Info" value="৳1" tone="info" />);
    expect(screen.getByTestId('stat-tile-dot', { includeHiddenElements: true }).props.className).toContain('bg-link');
  });

  it('renders warning dot tone with bg-wheat-500', () => {
    render(<StatTile label="Warning" value="৳1" tone="warning" />);
    expect(screen.getByTestId('stat-tile-dot', { includeHiddenElements: true }).props.className).toContain('bg-wheat-500');
  });

  it('renders neutral dot tone with bg-ink-500', () => {
    render(<StatTile label="Neutral" value="৳1" tone="neutral" />);
    expect(screen.getByTestId('stat-tile-dot', { includeHiddenElements: true }).props.className).toContain('bg-ink-500');
  });

  it('supports custom dotColor', () => {
    render(<StatTile label="Custom" value="10" dotColor="#123456" />);
    expect(screen.getByTestId('stat-tile-dot', { includeHiddenElements: true }).props.style).toEqual({
      backgroundColor: '#123456',
    });
  });

  it('shows placeholder bar and never "0" or value when loading', () => {
    render(<StatTile label="Net position" value={0} loading testID="stat-tile" />);
    // Placeholder bar is visible
    expect(screen.getByTestId('stat-tile-placeholder')).toBeOnTheScreen();
    // Value is not rendered, never "0"
    expect(screen.queryByTestId('stat-tile-value')).toBeNull();
    expect(screen.queryByText('0')).toBeNull();

    const tile = screen.getByTestId('stat-tile');
    expect(tile.props.accessibilityLabel).toContain('loading');
    expect(tile.props['aria-busy']).toBe(true);
  });

  it('fits long values by shrinking or wrapping (adjustsFontSizeToFit, numberOfLines=2)', () => {
    const longValue = '৳99,99,99,999';
    render(<StatTile label="Net balance" value={longValue} />);
    const value = screen.getByTestId('stat-tile-value');
    expect(value.props.adjustsFontSizeToFit).toBe(true);
    expect(value.props.numberOfLines).toBe(2);
    expect(value.props.minimumFontScale).toBe(0.65);
    expect(screen.getByText(longValue)).toBeOnTheScreen();
  });

  it('supports pressable interaction when onPress is provided', () => {
    const onPress = jest.fn();
    render(<StatTile label="Tappable" value="100" onPress={onPress} testID="stat-tile" />);
    const tile = screen.getByTestId('stat-tile');
    expect(tile.props.accessibilityRole).toBe('button');
    fireEvent.press(tile);
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
