import * as React from 'react';
import { AccessibilityInfo, Text } from 'react-native';
import { useReducedMotion, withTiming } from 'react-native-reanimated';

import { act, cleanup, fireEvent, render, screen, setup } from '@/lib/test-utils';

import { Button } from './button';

afterEach(() => {
  cleanup();
  jest.restoreAllMocks();
});

describe('button rendering and variants', () => {
  it('should render correctly', () => {
    render(<Button testID="button" />);
    expect(screen.getByTestId('button')).toBeOnTheScreen();
  });

  it('should render correctly if we add explicit child', () => {
    render(
      <Button testID="button">
        <Text>Custom child</Text>
      </Button>,
    );
    expect(screen.getByText('Custom child')).toBeOnTheScreen();
  });

  it('should render the label correctly with sentence case', () => {
    render(<Button testID="button" label="Submit payment" />);
    expect(screen.getByTestId('button')).toBeOnTheScreen();
    expect(screen.getByText('Submit payment')).toBeOnTheScreen();
    expect(screen.getByTestId('button-label').props.className).toContain('text-row-title');
  });

  it('should have pill shape and height 44 by default', () => {
    render(<Button testID="button" label="Primary action" />);
    const button = screen.getByTestId('button');
    expect(button.props.className).toContain('rounded-full');
    expect(button.props.className).toContain('min-h-[44px]');
  });

  it('should support compact size with height 40 and hitSlop for 44 touch target', () => {
    render(<Button testID="button" size="compact" label="Compact action" />);
    const button = screen.getByTestId('button');
    expect(button.props.className).toContain('min-h-[40px]');
    expect(button.props.hitSlop).toEqual({ top: 2, bottom: 2, left: 0, right: 0 });
  });

  it('should render primary variant by default (accent fill, on-accent text)', () => {
    render(<Button testID="button" label="Save" />);
    expect(screen.getByTestId('button').props.className).toContain('bg-accent');
    expect(screen.getByTestId('button-label').props.className).toContain('text-on-accent');
  });

  it('should render secondary variant (surface-container fill, ink-900 text)', () => {
    render(<Button testID="button" variant="secondary" label="Cancel" />);
    expect(screen.getByTestId('button').props.className).toContain('bg-surface-container');
    expect(screen.getByTestId('button-label').props.className).toContain('text-ink-900');
  });

  it('should render text variant (no fill, link text) with minimum 44 touch target', () => {
    render(<Button testID="button" variant="text" label="Learn more" />);
    const button = screen.getByTestId('button');
    expect(button.props.className).toContain('bg-transparent');
    expect(button.props.className).toContain('min-h-[44px]');
    expect(button.props.className).toContain('min-w-[44px]');
    expect(screen.getByTestId('button-label').props.className).toContain('text-link');
  });

  it('should render destructive variant (no fill, clay-500 text)', () => {
    render(<Button testID="button" variant="destructive" label="Delete transaction" />);
    expect(screen.getByTestId('button').props.className).toContain('bg-transparent');
    expect(screen.getByTestId('button-label').props.className).toContain('text-clay-500');
  });
});

describe('button states and interactions', () => {
  it('should render loading indicator when loading with no label', () => {
    render(<Button testID="button" loading={true} />);
    expect(screen.getByTestId('button')).toBeOnTheScreen();
    expect(screen.getByTestId('button-activity-indicator')).toBeOnTheScreen();
  });

  it('should call onPress handler when clicked', async () => {
    const onClick = jest.fn();
    const { user } = setup(
      <Button testID="button" label="Click the button" onPress={onClick} />,
    );
    expect(screen.getByTestId('button')).toBeOnTheScreen();
    await user.press(screen.getByTestId('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should show dimmed button when disabled and not respond to taps', async () => {
    const onClick = jest.fn();
    const { user } = setup(
      <Button
        testID="button"
        label="Disabled action"
        disabled={true}
        onPress={onClick}
      />,
    );
    const button = screen.getByTestId('button');
    expect(button.props.className).toContain('opacity-50');
    expect(button).toBeDisabled();
    await user.press(button);
    expect(onClick).toHaveBeenCalledTimes(0);
  });

  it('should show label ending with "…" when pending and ignore taps', async () => {
    const onClick = jest.fn();
    const { user } = setup(
      <Button
        testID="button"
        label="Saving"
        pending={true}
        onPress={onClick}
      />,
    );
    expect(screen.getByText('Saving…')).toBeOnTheScreen();
    const button = screen.getByTestId('button');
    expect(button).toBeDisabled();
    await user.press(button);
    expect(onClick).toHaveBeenCalledTimes(0);
  });

  it('should fire onPress only once on double tap when pending state activates', async () => {
    function TestComponent() {
      const [isPending, setIsPending] = React.useState(false);
      return (
        <Button
          testID="button"
          label="Submit"
          pending={isPending}
          onPress={() => {
            setIsPending(true);
          }}
        />
      );
    }

    const { user } = setup(<TestComponent />);
    const button = screen.getByTestId('button');
    await user.press(button);
    expect(screen.getByText('Submit…')).toBeOnTheScreen();
    await user.press(button);
    expect(screen.getByText('Submit…')).toBeOnTheScreen();
  });
});

describe('button animation and accessibility', () => {
  it('should announce button role and disabled/busy states to screen readers', () => {
    render(<Button testID="button" label="Submit" pending={true} />);
    const button = screen.getByTestId('button');
    expect(button.props.accessibilityRole).toBe('button');
    expect(button.props.accessibilityState).toEqual(
      expect.objectContaining({
        disabled: true,
        busy: true,
      }),
    );
  });

  it('should scale to 0.98 on pressIn and return to 1 on pressOut', () => {
    render(<Button testID="button" label="Press me" />);
    const button = screen.getByTestId('button');

    fireEvent(button, 'pressIn');
    expect(withTiming).toHaveBeenCalledWith(
      0.98,
      expect.objectContaining({ duration: 80 }),
    );

    fireEvent(button, 'pressOut');
    expect(withTiming).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ duration: 80 }),
    );
  });

  it('should not scale on press when AccessibilityInfo reduce motion is enabled', () => {
    let listener: ((enabled: boolean) => void) | undefined;
    jest.spyOn(AccessibilityInfo, 'addEventListener').mockImplementation((_event, cb: any) => {
      listener = cb;
      return { remove: jest.fn() } as any;
    });

    render(<Button testID="button" label="Reduce motion" />);
    act(() => {
      listener?.(true);
    });

    const button = screen.getByTestId('button');
    jest.mocked(withTiming).mockClear();

    fireEvent(button, 'pressIn');
    expect(withTiming).not.toHaveBeenCalledWith(0.98, expect.anything());
  });

  it('should not scale on press when Reanimated reduced motion is enabled', () => {
    jest.mocked(useReducedMotion).mockReturnValue(true);

    render(<Button testID="button" label="Reduce motion" />);
    const button = screen.getByTestId('button');
    jest.mocked(withTiming).mockClear();

    fireEvent(button, 'pressIn');
    expect(withTiming).not.toHaveBeenCalledWith(0.98, expect.anything());
  });

  it('should wrap or truncate long label with numberOfLines and ellipsizeMode', () => {
    render(
      <Button
        testID="button"
        label="This is a very long button label that might need to wrap or truncate gracefully"
      />,
    );
    const label = screen.getByTestId('button-label');
    expect(label.props.numberOfLines).toBe(2);
    expect(label.props.ellipsizeMode).toBe('tail');
  });
});
