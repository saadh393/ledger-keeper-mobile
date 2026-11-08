import type { TextProps, TextStyle } from 'react-native';
import type { TxKeyPath } from '@/lib/i18n';
import { isLoaded } from 'expo-font';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Text as NNText, StyleSheet } from 'react-native';
import { useResolveClassNames } from 'uniwind';

import { fontFamily } from '@/lib/theme/font-family';
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
  const { t, i18n } = useTranslation();
  const classStyle = useResolveClassNames(
    twMerge('text-body text-ink-900', className),
  );
  const textStyle = StyleSheet.flatten([classStyle, style]) as TextStyle;
  const family = fontFamily(textStyle.fontWeight, i18n.language);
  const { fontWeight, ...rest } = textStyle;

  return (
    <NNText
      style={isLoaded(family) ? { ...rest, fontFamily: family } : textStyle}
      {...props}
    >
      {tx ? t(tx) : children}
    </NNText>
  );
}
