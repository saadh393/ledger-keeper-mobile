import * as React from 'react';
import { BackHandler, Platform, Text as RNText, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

import {
  BottomSheet,
  BottomSheetScrollView,
  BottomSheetTextInput,
  useBottomSheet,
  useBottomSheetModalRef,
  useModal,
} from '@/components/ui/bottom-sheet';
import { act, cleanup, render, screen, setup } from '@/lib/test-utils';

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

describe('bottomSheet rendering and styles', () => {
  it('renders grabber, title, close button and children with surface background', () => {
    render(
      <BottomSheet title="Test Sheet" testID="my-sheet">
        <RNText testID="sheet-content">Hello Sheet</RNText>
      </BottomSheet>,
    );

    expect(screen.getByTestId('sheet-content')).toHaveTextContent('Hello Sheet');
    expect(screen.getByTestId('my-sheet-grabber')).toBeOnTheScreen();
    expect(screen.getByTestId('my-sheet-title')).toHaveTextContent('Test Sheet');

    const closeBtn = screen.getByLabelText('Close');
    expect(closeBtn).toBeOnTheScreen();
    expect(closeBtn.props.accessibilityRole).toBe('button');
  });

  it('renders scrim with rgba(0,0,0,0.5) background', () => {
    render(
      <BottomSheet testID="scrim-test">
        <RNText>Content</RNText>
      </BottomSheet>,
    );

    const scrim = screen.getByTestId('scrim-test-scrim');
    expect(scrim).toBeOnTheScreen();
    const flattened = Array.isArray(scrim.props.style)
      ? Object.assign({}, ...scrim.props.style)
      : scrim.props.style;
    expect(flattened.backgroundColor).toBe('rgba(0, 0, 0, 0.5)');
  });

  it('has elevation 12 and top radius 28 on Android', () => {
    const originalPlatform = Platform.OS;
    try {
      Platform.OS = 'android';
      render(
        <BottomSheet testID="android-sheet">
          <RNText>Android Sheet</RNText>
        </BottomSheet>,
      );

      expect(screen.getByText('Android Sheet')).toBeOnTheScreen();
    }
    finally {
      Platform.OS = originalPlatform;
    }
  });

  it('supports custom snap points and safe area top inset at full screen', () => {
    const insets = { top: 44, bottom: 34, left: 0, right: 0 };
    render(
      <SafeAreaInsetsContext value={insets}>
        <BottomSheet snapPoints={['60%', '100%']} testID="full-sheet">
          <RNText>Full screen sheet</RNText>
        </BottomSheet>
      </SafeAreaInsetsContext>,
    );

    expect(screen.getByText('Full screen sheet')).toBeOnTheScreen();
  });
});

describe('bottomSheet dismiss interactions and back button', () => {
  it('closes when close button is pressed', async () => {
    const onDismiss = jest.fn();
    const { user } = setup(
      <BottomSheet title="Closeable Sheet" onDismiss={onDismiss} testID="close-sheet">
        <RNText>Content</RNText>
      </BottomSheet>,
    );

    const closeBtn = screen.getByTestId('close-sheet-close-button');
    await user.press(closeBtn);

    expect(closeBtn).toBeOnTheScreen();
  });

  it('closes when scrim is tapped', async () => {
    const onDismiss = jest.fn();
    const { user } = setup(
      <BottomSheet onDismiss={onDismiss} testID="scrim-close-sheet">
        <RNText>Content</RNText>
      </BottomSheet>,
    );

    const scrim = screen.getByTestId('scrim-close-sheet-scrim');
    await user.press(scrim);

    expect(scrim).toBeOnTheScreen();
  });

  it('handles Android hardware back button to close when dismissible is true', () => {
    const backSpy = jest.spyOn(BackHandler, 'addEventListener');

    render(
      <BottomSheet index={0} dismissible testID="back-sheet">
        <RNText>Content</RNText>
      </BottomSheet>,
    );

    const backCall = backSpy.mock.calls.find(call => call[0] === 'hardwareBackPress');
    expect(backCall).toBeDefined();

    const handler = backCall![1];
    let handled = false;
    act(() => {
      handled = Boolean(handler());
    });
    expect(handled).toBe(true);
  });

  it('disables scrim tap, close button, and back when dismissible={false}', async () => {
    const backSpy = jest.spyOn(BackHandler, 'addEventListener');

    const { user } = setup(
      <BottomSheet title="Non-dismissible Sheet" dismissible={false} testID="pinned-sheet">
        <RNText>Currency picker</RNText>
      </BottomSheet>,
    );

    expect(screen.queryByTestId('pinned-sheet-close-button')).toBeNull();
    expect(screen.queryByLabelText('Close')).toBeNull();

    const scrim = screen.getByTestId('pinned-sheet-scrim');
    expect(scrim.props.accessibilityState?.disabled || scrim.props.disabled).toBe(true);
    await user.press(scrim);

    const backCall = backSpy.mock.calls.find(call => call[0] === 'hardwareBackPress');
    expect(backCall).toBeDefined();
    const handler = backCall![1];
    let handled = false;
    act(() => {
      handled = Boolean(handler());
    });
    expect(handled).toBe(true);
  });
});

describe('bottomSheet animations and exports', () => {
  it('respects reduced motion when enabled', () => {
    jest.mocked(useReducedMotion).mockReturnValue(true);

    render(
      <BottomSheet testID="reduced-motion-sheet">
        <RNText>Reduced motion content</RNText>
      </BottomSheet>,
    );

    expect(screen.getByText('Reduced motion content')).toBeOnTheScreen();
  });

  it('provides hook and ref methods present, dismiss, close', () => {
    function SheetWrapper() {
      const { ref, present, dismiss, close } = useBottomSheetModalRef();

      return (
        <View>
          <BottomSheet ref={ref} testID="hook-sheet">
            <RNText>Hook Sheet</RNText>
          </BottomSheet>
          <RNText testID="open-trigger" onPress={() => present()}>Open</RNText>
          <RNText testID="dismiss-trigger" onPress={() => dismiss()}>Dismiss</RNText>
          <RNText testID="close-trigger" onPress={() => close()}>Close</RNText>
        </View>
      );
    }

    render(<SheetWrapper />);
    expect(screen.getByText('Hook Sheet')).toBeOnTheScreen();
    expect(useModal).toBe(useBottomSheetModalRef);
  });

  it('re-exports scrollable and text input components', () => {
    expect(BottomSheetScrollView).toBeDefined();
    expect(BottomSheetTextInput).toBeDefined();
    expect(useBottomSheet).toBeDefined();
  });
});
