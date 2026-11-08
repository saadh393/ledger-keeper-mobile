import type {
  NativeSyntheticEvent,
  TargetedEvent,
  TextInputProps,
} from 'react-native';
import * as React from 'react';
import { TextInput as NTextInput, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { useThemeColors } from '@/lib/theme/use-theme-colors';
import { tv } from '@/lib/tv';

const inputTv = tv({
  slots: {
    container: 'mb-4',
    label: 'mb-1 text-label text-ink-900',
    input:
      'min-h-[44px] rounded-[12px] border border-transparent bg-surface-container px-4 py-3 text-body-l text-ink-900',
    error: 'mt-1 text-meta text-clay-500',
  },

  variants: {
    focused: {
      true: {
        input: 'border-border-strong',
      },
    },
    error: {
      true: {
        input: 'border-clay-500',
      },
    },
    disabled: {
      true: {
        container: 'opacity-50',
      },
    },
  },
  compoundVariants: [
    {
      error: true,
      focused: true,
      class: {
        input: 'border-clay-500',
      },
    },
  ],
  defaultVariants: {
    focused: false,
    error: false,
    disabled: false,
  },
});

export type NInputProps = {
  label?: string;
  disabled?: boolean;
  error?: string;
  containerClassName?: string;
} & TextInputProps;

export function Input({
  ref,
  ...props
}: NInputProps & { ref?: React.Ref<NTextInput | null> }) {
  const {
    label,
    error,
    testID,
    disabled = false,
    onBlur: onBlurProp,
    onFocus: onFocusProp,
    className = '',
    containerClassName = '',
    style,
    multiline,
    editable,
    ...inputProps
  } = props;
  const [isFocussed, setIsFocussed] = React.useState(false);
  const themeColors = useThemeColors();

  const onBlur = React.useCallback(
    (e: NativeSyntheticEvent<TargetedEvent>) => {
      setIsFocussed(false);
      onBlurProp?.(e);
    },
    [onBlurProp],
  );

  const onFocus = React.useCallback(
    (e: NativeSyntheticEvent<TargetedEvent>) => {
      setIsFocussed(true);
      onFocusProp?.(e);
    },
    [onFocusProp],
  );

  const isEditable = editable !== undefined ? editable : !disabled;

  const styles = inputTv({
    error: Boolean(error),
    focused: isFocussed,
    disabled: Boolean(disabled),
  });

  return (
    <View className={styles.container({ className: containerClassName })}>
      {label && (
        <Text
          testID={testID ? `${testID}-label` : undefined}
          className={styles.label()}
        >
          {label}
        </Text>
      )}
      <NTextInput
        testID={testID}
        ref={ref}
        placeholderTextColor={themeColors['ink-500']}
        className={styles.input({ className })}
        onBlur={onBlur}
        onFocus={onFocus}
        editable={isEditable}
        accessibilityState={{
          disabled: Boolean(disabled),
        }}
        aria-invalid={Boolean(error)}
        aria-errormessage={error && testID ? `${testID}-error` : undefined}
        multiline={multiline}
        style={[multiline ? { textAlignVertical: 'top' } : undefined, style]}
        {...inputProps}
        {...(disabled !== undefined ? { disabled } : {})}
      />
      {error && (
        <Text
          testID={testID ? `${testID}-error` : undefined}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          className={styles.error()}
        >
          {error}
        </Text>
      )}
    </View>
  );
}
