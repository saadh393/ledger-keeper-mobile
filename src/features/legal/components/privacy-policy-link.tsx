import Env from '@env';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Linking } from 'react-native';
import { Button } from '@/components/ui';

export function PrivacyPolicyLink() {
  const { t } = useTranslation();
  const url = Env.EXPO_PUBLIC_PRIVACY_POLICY_URL;
  if (!url)
    return null;
  return (
    <Button
      testID="privacy-policy-link"
      variant="text"
      size="sm"
      fullWidth={false}
      label={t('legal.privacyPolicy')}
      accessibilityRole="link"
      onPress={() => void Linking.openURL(url)}
      className="self-center"
    />
  );
}
