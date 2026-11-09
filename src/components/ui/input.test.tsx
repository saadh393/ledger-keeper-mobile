import * as React from 'react';
import { TextInput } from 'react-native';

import { cleanup, fireEvent, render, screen, setup } from '@/lib/test-utils';
import { colors } from '@/lib/theme/colors';

import { Input } from './input';
import { SheetTextInput } from './sheet-text-input';

let mockInSheet = false;

jest.mock('@gorhom/bottom-sheet', () => ({
  ...jest.requireActual('../../../__mocks__/@gorhom/bottom-sheet'),
  useBottomSheetInternal: () => (mockInSheet ? {} : null),
}));

afterEach(() => {
  cleanup();
  mockInSheet = false;
});

describe('input rendering and typography', () => {
  it('renders correctly', () => {
    render(<Input testID="input" />);
    expect(screen.getByTestId('input')).toBeOnTheScreen();
  });

  it('should render the placeholder correctly with ink-500 token', () => {
    render(<Input testID="input" placeholder="Enter your username" />);
    const input = screen.getByTestId('input');
    expect(input).toBeOnTheScreen();
    expect(screen.getByPlaceholderText('Enter your username')).toBeOnTheScreen();
    expect(input.props.placeholderTextColor).toBe(colors.light['ink-500']);
  });

  it('should render the label correctly with label typography style (13, 500)', () => {
    render(<Input testID="input" label="Username" />);
    expect(screen.getByTestId('input')).toBeOnTheScreen();

    const label = screen.getByTestId('input-label');
    expect(label).toHaveTextContent('Username');
    expect(label.props.className).toContain('text-label');
    expect(label.props.className).toContain('text-ink-900');
  });

  it('should render the error message with meta style (12, 400) and clay-500', () => {
    render(<Input testID="input" error="This is an error message" />);
    expect(screen.getByTestId('input')).toBeOnTheScreen();

    const error = screen.getByTestId('input-error');
    expect(error).toHaveTextContent('This is an error message');
    expect(error.props.className).toContain('text-meta');
    expect(error.props.className).toContain('text-clay-500');
  });

  it('should announce error to screen readers', () => {
    render(<Input testID="input" error="Invalid account number" />);
    const error = screen.getByTestId('input-error');
    expect(error.props.accessibilityRole).toBe('alert');
    expect(error.props.accessibilityLiveRegion).toBe('polite');

    const input = screen.getByTestId('input');
    expect(input.props['aria-invalid']).toBe(true);
    expect(input.props['aria-errormessage']).toBe('input-error');
  });

  it('should render the label, error message & placeholder correctly', () => {
    render(
      <Input
        testID="input"
        label="Username"
        placeholder="Enter your username"
        error="This is an error message"
      />,
    );
    expect(screen.getByTestId('input')).toBeOnTheScreen();

    expect(screen.getByTestId('input-label')).toHaveTextContent('Username');
    expect(screen.getByTestId('input-error')).toBeOnTheScreen();
    expect(screen.getByTestId('input-error')).toHaveTextContent('This is an error message');
    expect(screen.getByPlaceholderText('Enter your username')).toBeOnTheScreen();
  });

  it('should use body-L typography style (16) and ink-900 for text', () => {
    render(<Input testID="input" value="Amount" />);
    const input = screen.getByTestId('input');
    expect(input.props.className).toContain('text-body-l');
    expect(input.props.className).toContain('text-ink-900');
  });

  it('should render rightAccessory when provided', () => {
    const { Text: RText } = require('react-native');
    render(
      <Input
        testID="input"
        rightAccessory={<RText testID="accessory">Toggle</RText>}
      />,
    );
    expect(screen.getByTestId('accessory')).toBeOnTheScreen();
    expect(screen.getByTestId('input').props.className).toContain('pr-12');
  });
});

describe('input states, borders, and events', () => {
  it('should have radius 12, surface-container fill, and no border at rest', () => {
    render(<Input testID="input" />);
    const input = screen.getByTestId('input');
    expect(input.props.className).toContain('rounded-[12px]');
    expect(input.props.className).toContain('bg-surface-container');
    expect(input.props.className).toContain('border-transparent');
    expect(input.props.className).not.toContain('border-border-strong');
  });

  it('should show border-strong border on focus', () => {
    render(<Input testID="input" />);
    const input = screen.getByTestId('input');

    fireEvent(input, 'focus');
    expect(input.props.className).toContain('border-border-strong');

    fireEvent(input, 'blur');
    expect(input.props.className).not.toContain('border-border-strong');
    expect(input.props.className).toContain('border-transparent');
  });

  it('should show clay-500 border when an error exists even when not focused', () => {
    render(<Input testID="input" error="Field required" />);
    const input = screen.getByTestId('input');
    expect(input.props.className).toContain('border-clay-500');

    fireEvent(input, 'focus');
    expect(input.props.className).toContain('border-clay-500');
  });

  it('should trigger onFocus event correctly', async () => {
    const onFocus = jest.fn();
    const { user } = setup(<Input testID="input" onFocus={onFocus} />);

    const input = screen.getByTestId('input');
    await user.type(input, 'test text');
    expect(onFocus).toHaveBeenCalledTimes(1);
  });

  it('should trigger onBlur event correctly', async () => {
    const onBlur = jest.fn();
    const { user } = setup(<Input testID="input" onBlur={onBlur} />);

    const input = screen.getByTestId('input');
    await user.type(input, 'test text');
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('should trigger onChangeText event correctly', async () => {
    const onChangeText = jest.fn();
    const { user } = setup(
      <Input testID="input" onChangeText={onChangeText} />,
    );

    const input = screen.getByTestId('input');
    await user.type(input, '123456789');
    expect(onChangeText).toHaveBeenCalledTimes(9);
    expect(onChangeText).toHaveBeenCalledWith('123456789');
  });

  it('should be dimmed and not editable when disabled prop is true', () => {
    render(<Input testID="input" disabled={true} containerClassName="container-box" />);

    const input = screen.getByTestId('input');
    expect(input.props.disabled).toBe(true);
    expect(input.props.editable).toBe(false);
    expect(input.props.accessibilityState).toEqual({ disabled: true });
  });

  it('should grow with content when multiline is true', () => {
    render(<Input testID="input" multiline={true} />);
    const input = screen.getByTestId('input');
    expect(input.props.multiline).toBe(true);
    expect(input.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ textAlignVertical: 'top' })]),
    );
  });
});

describe('input keyboard handling', () => {
  it('uses a plain TextInput outside a bottom sheet', () => {
    render(<Input testID="input" />);

    expect(screen.UNSAFE_queryByType(SheetTextInput)).toBeNull();
    expect(screen.UNSAFE_getByType(TextInput)).toBeTruthy();
  });

  it('uses the sheet-aware text input inside a bottom sheet so the sheet follows the keyboard', () => {
    mockInSheet = true;

    render(<Input testID="input" error="Name is required" />);

    expect(screen.UNSAFE_getByType(SheetTextInput)).toBeTruthy();
    expect(screen.getByTestId('input-error')).toHaveTextContent('Name is required');
  });
});
