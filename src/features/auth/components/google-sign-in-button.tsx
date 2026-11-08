import Env from '@env';
import { onlineManager } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Google } from '@/components/ui/icons';
import { Text } from '@/components/ui/text';
import { authClient, getAuthErrorMessage } from '@/features/auth/api/auth-client';
import { useAuthStore } from '@/features/auth/use-auth-store';
import { useThemeColors } from '@/lib/theme/use-theme-colors';

export type GoogleSignInButtonProps = {
  disabled?: boolean;
  onSuccess?: (token: string) => void;
  onPendingChange?: (isPending: boolean) => void;
};

function GoogleAuthErrorMessage({ error }: { error: string }) {
  return (
    <View
      testID="google-auth-error"
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      className="mt-3 rounded-[12px] bg-clay-100 p-3"
    >
      <Text className="text-meta text-clay-500">{error}</Text>
    </View>
  );
}

function GoogleButtonContent({
  isPending,
  labelText,
  indicatorColor,
}: {
  isPending: boolean;
  labelText: string;
  indicatorColor: string;
}) {
  return (
    <View className="flex-row items-center justify-center gap-2.5">
      {isPending
        ? (
            <ActivityIndicator
              size="small"
              color={indicatorColor}
              testID="google-button-loading"
            />
          )
        : (
            <Google size={18} testID="google-icon" />
          )}
      <Text className="text-row-title font-medium text-ink-900">
        {labelText}
      </Text>
    </View>
  );
}

function useGoogleSignIn({
  disabled,
  onSuccess,
  onPendingChange,
}: GoogleSignInButtonProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [isPending, setIsPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handlePendingChange = React.useCallback(
    (pending: boolean) => {
      setIsPending(pending);
      onPendingChange?.(pending);
    },
    [onPendingChange],
  );

  const handlePress = React.useCallback(async () => {
    if (isPending || disabled) {
      return;
    }
    setError(null);

    if (!onlineManager.isOnline()) {
      setError(t('auth.errors.offline'));
      return;
    }

    handlePendingChange(true);
    try {
      const result = await authClient.signIn.social({
        provider: 'google',
        callbackURL: `${Env.EXPO_PUBLIC_SCHEME}://`,
      });

      if (
        result
        && (result.canceled
          || (result as { type?: string }).type === 'cancel'
          || (result as { type?: string }).type === 'dismiss')
      ) {
        return;
      }

      if (result && (result as { error?: { message?: string } | null }).error) {
        setError(t('auth.errors.googleFailed'));
        return;
      }

      const token
        = typeof result === 'string'
          ? result
          : result?.token
            ?? result?.data?.token
            ?? (result as { data?: { session?: { token?: string } } })?.data?.session?.token
            ?? null;

      if (!token) {
        if (result && !result.canceled) {
          setError(t('auth.errors.googleFailed'));
        }
        return;
      }

      await useAuthStore.getState().signIn(token);

      if (onSuccess) {
        onSuccess(token);
      }
      else {
        router.replace('/');
      }
    }
    catch (err: unknown) {
      const { message } = getAuthErrorMessage(err, 'google', t);
      setError(message);
    }
    finally {
      handlePendingChange(false);
    }
  }, [disabled, handlePendingChange, isPending, onSuccess, router, t]);

  return { isPending, error, handlePress };
}

export function GoogleSignInButton(props: GoogleSignInButtonProps) {
  const { disabled = false } = props;
  const { t } = useTranslation();
  const themeColors = useThemeColors();
  const { isPending, error, handlePress } = useGoogleSignIn(props);

  const isButtonDisabled = disabled || isPending;
  const labelText = isPending
    ? `${t('auth.continueWithGoogle')}…`
    : t('auth.continueWithGoogle');

  return (
    <View className="w-full">
      <Button
        testID="google-sign-in-button"
        variant="secondary"
        disabled={isButtonDisabled}
        pending={isPending}
        onPress={handlePress}
        accessibilityLabel={t('auth.continueWithGoogle')}
      >
        <GoogleButtonContent
          isPending={isPending}
          labelText={labelText}
          indicatorColor={themeColors['ink-900']}
        />
      </Button>

      {error ? <GoogleAuthErrorMessage error={error} /> : null}
    </View>
  );
}
