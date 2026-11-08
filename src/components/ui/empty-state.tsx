import type { LucideIcon, LucideProps } from 'lucide-react-native';
import type { ViewProps } from 'react-native';
import type { Tone } from '@/components/ui/tone-tile';
import { CircleAlert, Inbox } from 'lucide-react-native';
import * as React from 'react';

import { View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { ToneTile } from '@/components/ui/tone-tile';
import { twMerge } from '@/lib/tw-merge';

export type EmptyStateVariant = 'empty' | 'error';

export type EmptyStateAction = {
  label: string;
  onPress: () => void;
  loading?: boolean;
};

export type EmptyStateProps = {
  variant?: EmptyStateVariant;
  title: string;
  body?: string;
  tone?: Tone;
  icon?: LucideIcon | React.ComponentType<LucideProps> | React.ReactNode;
  action?: EmptyStateAction;
  actionLabel?: string;
  onAction?: () => void;
  onRetry?: () => void;
  actionLoading?: boolean;
  className?: string;
  testID?: string;
} & ViewProps;

export function EmptyState({
  variant = 'empty',
  title,
  body,
  tone,
  icon,
  action,
  actionLabel,
  onAction,
  onRetry,
  actionLoading = false,
  className = '',
  testID,
  ...props
}: EmptyStateProps) {
  const isError = variant === 'error';
  const resolvedTone: Tone = tone ?? (isError ? 'expense' : 'info');
  const defaultIcon = isError ? CircleAlert : Inbox;
  const resolvedIcon = icon ?? defaultIcon;

  // Resolve action button
  const actionPressHandler = action?.onPress ?? onAction ?? (isError ? onRetry : undefined);
  const resolvedActionLabel = action?.label ?? actionLabel ?? (isError && actionPressHandler ? 'Retry' : undefined);
  const isActionLoading = action?.loading ?? actionLoading;
  const hasAction = Boolean(actionPressHandler && resolvedActionLabel);

  return (
    <View
      testID={testID}
      className={twMerge('items-center justify-center p-6 text-center', className)}
      {...props}
    >
      <ToneTile
        size={48}
        tone={resolvedTone}
        icon={resolvedIcon}
        className="mb-4"
      />

      <Text
        testID="empty-state-title"
        className="text-center text-title text-ink-900"
        numberOfLines={1}
      >
        {title}
      </Text>

      {body
        ? (
            <Text
              testID="empty-state-body"
              className="mt-1 text-center text-body text-ink-700"
            >
              {body}
            </Text>
          )
        : null}

      {hasAction
        ? (
            <View className="mt-4" testID="empty-state-action-container">
              <Button
                label={resolvedActionLabel}
                onPress={actionPressHandler}
                loading={isActionLoading}
                fullWidth={false}
                size="default"
              />
            </View>
          )
        : null}
    </View>
  );
}
