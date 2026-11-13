import { useForm } from '@tanstack/react-form';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Button, Input, Text } from '@/components/ui';
import { getFieldError } from '@/components/ui/form-utils';
import { getAuthErrorMessage } from '@/features/auth/api/auth-client';
import { requestPasswordReset } from '@/features/auth/api/request-password-reset';
import { AuthPageLayout } from '@/features/auth/components/auth-page-layout';
import { createEmailSchema } from '@/features/auth/schemas/auth-schemas';
import { getCooldownSeconds } from '@/features/auth/utils/get-cooldown-seconds';
import { saveResetEmail } from '@/features/auth/utils/reset-email';

export function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const [sentAt, setSentAt] = React.useState<number | null>(null);
  const [now, setNow] = React.useState(() => Date.now());
  const [sent, setSent] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const cooldown = getCooldownSeconds(sentAt, now);
  const emailValidator = React.useMemo(() => createEmailSchema({ emailRequired: t('auth.errors.emailRequired'), emailInvalid: t('auth.errors.emailInvalid') }), [t]);

  React.useEffect(() => {
    if (cooldown <= 0)
      return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const form = useForm({
    defaultValues: { email: params.email ?? '' },
    onSubmit: async ({ value }) => {
      setError(null);
      try {
        await requestPasswordReset(value.email);
        saveResetEmail(value.email);
        setSent(true);
        const time = Date.now();
        setSentAt(time);
        setNow(time);
      }
      catch (err) {
        setError(getAuthErrorMessage(err, 'signin', t).message);
      }
    },
  });

  return (
    <AuthPageLayout testID="forgot-password-screen" title={t('auth.reset.forgotTitle')} subtitle={t('auth.reset.forgotSubtitle')} onBack={router.back}>
      <form.Field name="email" validators={{ onChange: emailValidator, onSubmit: emailValidator }}>
        {field => (
          <Input
            testID="forgot-email-input"
            label={t('auth.email')}
            placeholder={t('auth.emailPlaceholder')}
            value={field.state.value}
            onChangeText={field.handleChange}
            onBlur={field.handleBlur}
            error={getFieldError(field)}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
          />
        )}
      </form.Field>
      {sent ? <Text testID="forgot-sent" accessibilityRole="alert" className="mb-4 rounded-xl bg-selected p-3 text-body text-on-selected">{t('auth.reset.sent')}</Text> : null}
      {error ? <Text testID="forgot-error" accessibilityRole="alert" className="mb-4 rounded-xl bg-clay-100 p-3 text-meta text-clay-500">{error}</Text> : null}
      <form.Subscribe selector={state => state.isSubmitting}>
        {isSubmitting => (
          <Button
            testID="forgot-submit"
            label={isSubmitting ? t('auth.reset.sending') : cooldown > 0 ? t('auth.reset.resendIn', { seconds: cooldown }) : t('auth.reset.send')}
            pending={isSubmitting}
            disabled={isSubmitting || cooldown > 0}
            onPress={() => form.handleSubmit()}
          />
        )}
      </form.Subscribe>
      <View className="mt-4">
        <Button testID="forgot-back" variant="text" label={t('auth.reset.backToSignIn')} onPress={() => router.back()} />
      </View>
    </AuthPageLayout>
  );
}
