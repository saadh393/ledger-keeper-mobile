import type { TextProps, TextStyle } from 'react-native';
import type { TxKeyPath } from '@/lib/i18n';
import { isLoaded } from 'expo-font';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { I18nManager, Text as NNText, StyleSheet } from 'react-native';
import { useResolveClassNames } from 'uniwind';

import { translate } from '@/lib/i18n';
import { fontClass } from '@/lib/theme/font-class';
import { twMerge } from '@/lib/tw-merge';

type Props = {
  className?: string;
  tx?: TxKeyPath;
} & TextProps;

export function Text({
  className = '',
  style,
  tx,
  children,
  ...props
}: Props) {
  const { i18n } = useTranslation();
  const classStyle = useResolveClassNames(
    twMerge('text-body text-black dark:text-white', className),
  );
  const textStyle = StyleSheet.flatten([
    { writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' },
    classStyle,
    style,
  ]) as TextStyle;
  const { fontFamily } = useResolveClassNames(
    fontClass(textStyle.fontWeight, i18n.language),
  ) as TextStyle;
  const { fontWeight, ...rest } = textStyle;

  return (
    <NNText
      style={fontFamily && isLoaded(fontFamily) ? { ...rest, fontFamily } : textStyle}
      {...props}
    >
      {tx ? translate(tx) : children}
    </NNText>
  );
}
