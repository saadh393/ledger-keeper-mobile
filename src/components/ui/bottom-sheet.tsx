/* eslint-disable react-refresh/only-export-components */
import type {
  BottomSheetBackdropProps,
  BottomSheetHandleProps,
  BottomSheetModalProps,
} from '@gorhom/bottom-sheet';
import type { StyleProp, ViewStyle } from 'react-native';
import {
  BottomSheetFlatList,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetSectionList,
  BottomSheetTextInput,
  BottomSheetView,
  useBottomSheet,
  useBottomSheetModal,
  useBottomSheetTimingConfigs,
} from '@gorhom/bottom-sheet';
import { X } from 'lucide-react-native';
import * as React from 'react';
import {
  AccessibilityInfo,
  BackHandler,
  Keyboard,
  Pressable,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useReducedMotion,
} from 'react-native-reanimated';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/text';
import { useThemeColors } from '@/lib/theme/use-theme-colors';

export type BottomSheetRef = BottomSheetModal;

export type BottomSheetProps = Omit<BottomSheetModalProps, 'snapPoints'> & {
  title?: string;
  dismissible?: boolean;
  showCloseButton?: boolean;
  snapPoints?: (string | number)[];
  testID?: string;
  ref?: React.Ref<BottomSheetModal>;
  onRequestClose?: () => void;
};

function useIsReduceMotionEnabled(): boolean {
  const [reduceMotion, setReduceMotion] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (mounted && enabled) {
          setReduceMotion(true);
        }
      })
      .catch(() => {});

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (enabled) => {
        if (mounted) {
          setReduceMotion(Boolean(enabled));
        }
      },
    );

    return () => {
      mounted = false;
      subscription?.remove();
    };
  }, []);

  return reduceMotion;
}

export function useBottomSheetModalRef() {
  const ref = React.useRef<BottomSheetModal>(null);
  const present = React.useCallback((data?: any) => {
    ref.current?.present(data);
  }, []);
  const dismiss = React.useCallback(() => {
    ref.current?.dismiss();
  }, []);
  const close = React.useCallback(() => {
    ref.current?.close();
  }, []);
  return { ref, present, dismiss, close };
}

export const useModal = useBottomSheetModalRef;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type CustomBackdropProps = BottomSheetBackdropProps & {
  dismissible?: boolean;
  onClose: () => void;
  reducedMotion?: boolean;
  testID?: string;
};

function CustomBackdrop({
  style,
  dismissible = true,
  onClose,
  reducedMotion = false,
  testID,
}: CustomBackdropProps) {
  const entering = reducedMotion ? FadeIn.duration(0) : FadeIn.duration(240);
  const exiting = reducedMotion ? FadeOut.duration(0) : FadeOut.duration(240);

  return (
    <AnimatedPressable
      testID={testID ? `${testID}-scrim` : 'bottom-sheet-scrim'}
      accessibilityRole="button"
      accessibilityLabel="Close bottom sheet"
      disabled={!dismissible}
      onPress={dismissible ? onClose : undefined}
      entering={entering}
      exiting={exiting}
      style={[
        style,
        {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
      ]}
    />
  );
}

type BottomSheetHeaderProps = {
  title?: string;
  dismissible?: boolean;
  showCloseButton?: boolean;
  onClose: () => void;
  testID?: string;
};

function BottomSheetHeader({
  title,
  dismissible = true,
  showCloseButton = true,
  onClose,
  testID,
}: BottomSheetHeaderProps) {
  const themeColors = useThemeColors();
  const canShowClose = dismissible && showCloseButton;

  return (
    <View
      testID={testID ? `${testID}-handle` : 'bottom-sheet-handle'}
      className="w-full items-center"
    >
      <View
        testID={testID ? `${testID}-grabber` : 'bottom-sheet-grabber'}
        className="mt-3 mb-2 h-1 w-12 self-center rounded-full bg-border-strong"
        accessibilityRole="none"
        accessible={false}
      />
      {(title || canShowClose) && (
        <View className="min-h-[44px] w-full flex-row items-center justify-between px-4 pt-1 pb-2">
          {title
            ? (
                <>
                  {canShowClose ? <View className="size-11" /> : null}
                  <Text
                    testID={testID ? `${testID}-title` : 'bottom-sheet-title'}
                    className="flex-1 text-center text-title font-medium text-ink-900"
                  >
                    {title}
                  </Text>
                </>
              )
            : (
                <View className="flex-1" />
              )}
          {canShowClose && (
            <Pressable
              onPress={onClose}
              className="size-11 items-center justify-center rounded-full"
              accessibilityRole="button"
              accessibilityLabel="Close"
              accessibilityHint="Closes the bottom sheet"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              testID={
                testID ? `${testID}-close-button` : 'bottom-sheet-close-button'
              }
            >
              <X size={20} strokeWidth={1.75} color={themeColors['ink-500']} />
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

function useSheetImperativeRef(
  ref: React.Ref<BottomSheetModal> | undefined,
  internalRef: React.RefObject<BottomSheetModal | null>,
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>,
) {
  React.useImperativeHandle(
    ref,
    () => {
      const current = internalRef.current;
      if (!current) {
        return {
          present: (data?: any) => {
            setIsOpen(true);
            internalRef.current?.present(data);
          },
          dismiss: () => {
            setIsOpen(false);
            internalRef.current?.dismiss();
          },
          close: () => {
            setIsOpen(false);
            internalRef.current?.close();
          },
          snapToIndex: (idx: number) => {
            internalRef.current?.snapToIndex(idx);
          },
          snapToPosition: (pos: string | number) => {
            internalRef.current?.snapToPosition(pos);
          },
          expand: () => {
            internalRef.current?.expand();
          },
          collapse: () => {
            internalRef.current?.collapse();
          },
          forceClose: () => {
            setIsOpen(false);
            internalRef.current?.forceClose();
          },
        } as unknown as BottomSheetModal;
      }

      return new Proxy(current, {
        get(target, prop, receiver) {
          if (prop === 'present') {
            return (data?: any) => {
              setIsOpen(true);
              return target.present(data);
            };
          }
          if (prop === 'dismiss') {
            return (...args: any[]) => {
              setIsOpen(false);
              return (target as any).dismiss(...args);
            };
          }
          if (prop === 'close') {
            return (...args: any[]) => {
              setIsOpen(false);
              return (target as any).close(...args);
            };
          }
          return Reflect.get(target, prop, receiver);
        },
      });
    },
    [internalRef, setIsOpen],
  );
}

function useSheetBackHandler(
  isOpen: boolean,
  dismissible: boolean,
  onClose: () => void,
) {
  React.useEffect(() => {
    if (!isOpen)
      return;

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (!dismissible)
          return true;
        onClose();
        return true;
      },
    );

    return () => {
      subscription.remove();
    };
  }, [isOpen, dismissible, onClose]);
}

type SheetHandleRendererOptions = {
  handleComponent: React.FC<BottomSheetHandleProps> | null | undefined;
  title: string | undefined;
  dismissible: boolean;
  showCloseButton: boolean;
  handleClose: () => void;
  testID: string | undefined;
};

function useSheetHandleRenderer({
  handleComponent,
  title,
  dismissible,
  showCloseButton,
  handleClose,
  testID,
}: SheetHandleRendererOptions) {
  return React.useCallback(
    (handleProps: BottomSheetHandleProps) => {
      if (handleComponent !== undefined) {
        if (handleComponent === null)
          return null;
        return typeof handleComponent === 'function'
          ? handleComponent(handleProps)
          : handleComponent;
      }

      return (
        <BottomSheetHeader
          title={title}
          dismissible={dismissible}
          showCloseButton={showCloseButton}
          onClose={handleClose}
          testID={testID}
        />
      );
    },
    [handleComponent, title, dismissible, showCloseButton, handleClose, testID],
  );
}

type SheetBackdropRendererOptions = {
  backdropComponent: React.FC<BottomSheetBackdropProps> | undefined;
  dismissible: boolean;
  handleClose: () => void;
  shouldReduceMotion: boolean;
  testID: string | undefined;
};

function useSheetBackdropRenderer({
  backdropComponent,
  dismissible,
  handleClose,
  shouldReduceMotion,
  testID,
}: SheetBackdropRendererOptions) {
  return React.useCallback(
    (backdropProps: BottomSheetBackdropProps) => {
      if (backdropComponent)
        return backdropComponent(backdropProps);
      return (
        <CustomBackdrop
          {...backdropProps}
          dismissible={dismissible}
          onClose={handleClose}
          reducedMotion={shouldReduceMotion}
          testID={testID}
        />
      );
    },
    [backdropComponent, dismissible, handleClose, shouldReduceMotion, testID],
  );
}

function useDismissKeyboardOnClose(onAnimate: BottomSheetModalProps['onAnimate']) {
  return React.useCallback<NonNullable<BottomSheetModalProps['onAnimate']>>(
    (...args) => {
      if (args[1] === -1)
        Keyboard.dismiss();
      onAnimate?.(...args);
    },
    [onAnimate],
  );
}

function useSheetStyles(
  customBackgroundStyle: BottomSheetModalProps['backgroundStyle'],
  style: BottomSheetModalProps['style'],
) {
  const themeColors = useThemeColors();

  const combinedBackgroundStyle = React.useMemo(() => {
    const defaultBackground: ViewStyle = {
      backgroundColor: themeColors.surface,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
    };
    return [defaultBackground, customBackgroundStyle] as StyleProp<ViewStyle>;
  }, [themeColors.surface, customBackgroundStyle]);

  const combinedStyle = React.useMemo(() => {
    const raised: ViewStyle = {
      backgroundColor: themeColors.surface,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      elevation: 12,
    };
    return [raised, style] as StyleProp<ViewStyle>;
  }, [themeColors.surface, style]);

  return { combinedBackgroundStyle, combinedStyle };
}

export function BottomSheet({
  ref,
  snapPoints,
  title,
  dismissible = true,
  showCloseButton = true,
  testID,
  onRequestClose,
  backgroundStyle: customBackgroundStyle,
  backdropComponent,
  handleComponent,
  animationConfigs: customAnimationConfigs,
  index = 0,
  enableDynamicSizing = !snapPoints,
  maxDynamicContentSize,
  style,
  onChange,
  onDismiss,
  onAnimate,
  keyboardBehavior = 'interactive',
  keyboardBlurBehavior = 'restore',
  android_keyboardInputMode = 'adjustPan',
  topInset: customTopInset,
  ...restProps
}: BottomSheetProps) {
  const internalRef = React.useRef<BottomSheetModal>(null);
  const { height: windowHeight } = useWindowDimensions();
  const insets = React.use(SafeAreaInsetsContext);
  const [isOpen, setIsOpen] = React.useState(index >= 0);

  const systemReducedMotion = useIsReduceMotionEnabled();
  const reanimatedReducedMotion = useReducedMotion();
  const shouldReduceMotion = systemReducedMotion || Boolean(reanimatedReducedMotion);

  const defaultAnimationConfigs = useBottomSheetTimingConfigs({
    duration: shouldReduceMotion ? 0 : 240,
    easing: Easing.bezier(0.2, 0, 0, 1),
  });

  const handleClose = React.useCallback(() => {
    if (!dismissible)
      return;
    if (onRequestClose)
      return onRequestClose();
    setIsOpen(false);
    internalRef.current?.dismiss();
  }, [dismissible, onRequestClose]);

  useSheetImperativeRef(ref, internalRef, setIsOpen);
  useSheetBackHandler(isOpen, dismissible, handleClose);

  const renderHandle = useSheetHandleRenderer({
    handleComponent,
    title,
    dismissible,
    showCloseButton,
    handleClose,
    testID,
  });

  const renderBackdrop = useSheetBackdropRenderer({
    backdropComponent,
    dismissible,
    handleClose,
    shouldReduceMotion,
    testID,
  });

  const { combinedBackgroundStyle, combinedStyle } = useSheetStyles(
    customBackgroundStyle,
    style,
  );

  return (
    <BottomSheetModal
      {...restProps}
      ref={internalRef}
      index={index}
      snapPoints={snapPoints}
      topInset={customTopInset ?? insets?.top ?? 0}
      enableDynamicSizing={enableDynamicSizing}
      maxDynamicContentSize={maxDynamicContentSize ?? windowHeight * 0.85}
      style={combinedStyle}
      enablePanDownToClose={dismissible}
      enableOverDrag={dismissible}
      enableHandlePanningGesture={dismissible}
      keyboardBehavior={keyboardBehavior}
      keyboardBlurBehavior={keyboardBlurBehavior}
      android_keyboardInputMode={android_keyboardInputMode}
      animationConfigs={customAnimationConfigs ?? defaultAnimationConfigs}
      backgroundStyle={combinedBackgroundStyle}
      backdropComponent={renderBackdrop}
      handleComponent={renderHandle}
      onAnimate={useDismissKeyboardOnClose(onAnimate)}
      onChange={React.useCallback(
        (sheetIndex: number, position: number, type: any) => {
          setIsOpen(sheetIndex >= 0);
          onChange?.(sheetIndex, position, type);
        },
        [onChange],
      )}
      onDismiss={React.useCallback(() => {
        setIsOpen(false);
        onDismiss?.();
      }, [onDismiss])}
    />
  );
}

export const Modal = BottomSheet;

export {
  BottomSheetFlatList,
  BottomSheetScrollView,
  BottomSheetSectionList,
  BottomSheetTextInput,
  BottomSheetView,
  useBottomSheet,
  useBottomSheetModal,
};
