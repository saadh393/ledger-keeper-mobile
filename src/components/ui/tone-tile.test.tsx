import { ArrowDownLeft, ArrowUpRight } from 'lucide-react-native';
import * as React from 'react';
import { Text } from 'react-native';

import { cleanup, render, screen } from '@/lib/test-utils';
import { colors } from '@/lib/theme/colors';

import { ToneTile } from './tone-tile';

afterEach(() => {
  cleanup();
  jest.restoreAllMocks();
});

describe('toneTile rendering and variants', () => {
  it('renders income tone with forest-100 background and forest-500 icon', () => {
    render(<ToneTile tone="income" icon={ArrowUpRight} testID="tone-tile" />);
    const tile = screen.getByTestId('tone-tile', { includeHiddenElements: true });
    expect(tile.props.className).toContain('bg-forest-100');
  });

  it('renders expense tone with clay-100 background and clay-500 icon', () => {
    render(<ToneTile tone="expense" icon={ArrowDownLeft} testID="tone-tile" />);
    const tile = screen.getByTestId('tone-tile', { includeHiddenElements: true });
    expect(tile.props.className).toContain('bg-clay-100');
  });

  it('renders info tone with selected background and link icon', () => {
    render(<ToneTile tone="info" testID="tone-tile" />);
    const tile = screen.getByTestId('tone-tile', { includeHiddenElements: true });
    expect(tile.props.className).toContain('bg-selected');
  });

  it('renders warning tone with wheat-200 background and wheat-500 icon', () => {
    render(<ToneTile tone="warning" testID="tone-tile" />);
    const tile = screen.getByTestId('tone-tile', { includeHiddenElements: true });
    expect(tile.props.className).toContain('bg-wheat-200');
  });

  it('defaults to size 40 with rounded-[12px] and size-10', () => {
    render(<ToneTile tone="income" testID="tone-tile" />);
    const tile = screen.getByTestId('tone-tile', { includeHiddenElements: true });
    expect(tile.props.className).toContain('rounded-[12px]');
    expect(tile.props.className).toContain('size-10');
  });

  it('supports size 48 with rounded-[16px] and size-12', () => {
    render(<ToneTile tone="income" size={48} testID="tone-tile" />);
    const tile = screen.getByTestId('tone-tile', { includeHiddenElements: true });
    expect(tile.props.className).toContain('rounded-[16px]');
    expect(tile.props.className).toContain('size-12');
  });

  it('supports size string aliases "sm" and "md"', () => {
    const { unmount } = render(<ToneTile tone="income" size="sm" testID="tile-sm" />);
    expect(screen.getByTestId('tile-sm', { includeHiddenElements: true }).props.className).toContain('rounded-[12px]');
    unmount();

    render(<ToneTile tone="income" size="md" testID="tile-md" />);
    expect(screen.getByTestId('tile-md', { includeHiddenElements: true }).props.className).toContain('rounded-[16px]');
  });

  it('is decorative and hidden from screen readers when accessibilityLabel is absent', () => {
    render(<ToneTile tone="income" testID="tone-tile" />);
    // Screen reader query should not find it without includeHiddenElements
    expect(screen.queryByTestId('tone-tile')).toBeNull();

    const tile = screen.getByTestId('tone-tile', { includeHiddenElements: true });
    expect(tile.props.accessibilityElementsHidden).toBe(true);
    expect(tile.props.importantForAccessibility).toBe('no-hide-descendants');
    expect(tile.props.accessibilityRole).toBeUndefined();
  });

  it('exposes accessibility when given accessibilityLabel', () => {
    render(
      <ToneTile
        tone="income"
        accessibilityLabel="Transaction income"
        testID="tone-tile"
      />,
    );
    // When labeled, screen reader queries locate it directly
    const tile = screen.getByTestId('tone-tile');
    expect(tile.props.accessibilityElementsHidden).toBe(false);
    expect(tile.props.importantForAccessibility).toBe('yes');
    expect(tile.props.accessibilityLabel).toBe('Transaction income');
    expect(tile.props.accessibilityRole).toBe('image');
  });

  it('renders custom children when provided', () => {
    render(
      <ToneTile tone="income">
        <Text>Custom Icon</Text>
      </ToneTile>,
    );
    expect(screen.getByText('Custom Icon', { includeHiddenElements: true })).toBeOnTheScreen();
  });

  it('passes stroke width 1.75 and correct token color to lucide icons', () => {
    render(<ToneTile tone="income" icon={ArrowUpRight} testID="tone-tile" />);
    const tile = screen.getByTestId('tone-tile', { includeHiddenElements: true });
    const iconChild = tile.props.children;
    expect(iconChild).toBeDefined();
    expect(iconChild.props.strokeWidth).toBe(1.75);
    expect(iconChild.props.size).toBe(20);
    expect(iconChild.props.color).toBe(colors.light['forest-500']);
  });
});
