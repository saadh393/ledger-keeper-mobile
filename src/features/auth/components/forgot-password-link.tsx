import { useRouter } from 'expo-router';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';
import { Text } from '@/components/ui/text';

export type ForgotPasswordLinkProps = {
  getEmail: () => string;
  disabled: boolean;
};

export function ForgotPasswordLink({ getEmail, disabled }: ForgotPasswordLinkProps) {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <Pressable
      testID="forgot-password-link"
      accessibilityRole="button"
      disabled={disabled}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      className="-mt-2 mb-4 self-end"
      onPress={() => router.push({ pathname: '/forgot-password', params: { email: getEmail() } })}
    >
      <Text className="text-row-title text-link">{t('auth.reset.forgotLink')}</Text>
    </Pressable>
  );
}
