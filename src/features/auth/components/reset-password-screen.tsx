import type { TFunction } from 'i18next';
import { useForm } from '@tanstack/react-form';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input, Text } from '@/components/ui';
import { getFieldError } from '@/components/ui/form-utils';
import { authClient } from '@/features/auth/api/auth-client';
import { resetPassword } from '@/features/auth/api/reset-password';
import { AuthPageLayout } from '@/features/auth/components/auth-page-layout';
import { createResetPasswordSchema } from '@/features/auth/schemas/reset-password-schema';
import { setSessionNotice, signIn } from '@/features/auth/use-auth-store';
import { getResetError } from '@/features/auth/utils/get-reset-error';
import { isExpiredResetLink } from '@/features/auth/utils/is-expired-reset-link';
import { takeResetEmail } from '@/features/auth/utils/reset-email';

export function ResetPasswordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string; error?: string }>();
  const [expired, setExpired] = React.useState(() => isExpiredResetLink(params));
  const [error, setError] = React.useState<string | null>(null);
  const toSignIn = React.useCallback(() => router.replace('/auth'), [router]);
  const schema = React.useMemo(() => createResetPasswordSchema({
    passwordRequired: t('auth.errors.passwordRequired'),
    passwordMinLength: t('auth.errors.passwordMinLength'),
    passwordMismatch: t('auth.reset.mismatch'),
  }), [t]);

  const form = useForm({
    defaultValues: { password: '', confirm: '' },
    validators: { onSubmit: schema },
    onSubmit: async ({ value }) => {
      setError(null);
      try {
        await resetPassword(params.token!, value.password);
      }
      catch (err) {
        const result = getResetError(err, t as TFunction);
        if (result.type === 'expired')
          setExpired(true);
        else
          setError(result.message);
        return;
      }
      const email = takeResetEmail();
      if (email) {
        try {
          await signIn(await authClient.signInWithEmail(email, value.password));
          router.replace('/');
          return;
        }
        catch {}
      }
      setSessionNotice(t('auth.reset.updated'));
      router.replace('/auth');
    },
  });

  if (expired) {
    return (
      <AuthPageLayout testID="reset-password-expired" title={t('auth.reset.expired')} onBack={toSignIn}>
        <Button testID="reset-send-new" label={t('auth.reset.sendNew')} onPress={() => router.replace('/forgot-password')} />
      </AuthPageLayout>
    );
  }

  return (
    <AuthPageLayout testID="reset-password-screen" title={t('auth.reset.newTitle')} onBack={toSignIn}>
      <form.Field name="password">
        {field => (
          <Input
            testID="reset-password-input"
            label={t('auth.reset.newPassword')}
            placeholder={t('auth.newPasswordPlaceholder')}
            value={field.state.value}
            onChangeText={field.handleChange}
            onBlur={field.handleBlur}
            error={getFieldError(field)}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
          />
        )}
      </form.Field>
      <form.Field name="confirm">
        {field => (
          <Input
            testID="reset-confirm-input"
            label={t('auth.reset.confirmPassword')}
            value={field.state.value}
            onChangeText={field.handleChange}
            onBlur={field.handleBlur}
            error={getFieldError(field)}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
          />
        )}
      </form.Field>
      {error ? <Text testID="reset-error" accessibilityRole="alert" className="mb-4 rounded-xl bg-clay-100 p-3 text-meta text-clay-500">{error}</Text> : null}
      <form.Subscribe selector={state => state.isSubmitting}>
        {isSubmitting => (
          <Button
            testID="reset-submit"
            label={isSubmitting ? t('auth.reset.saving') : t('auth.reset.save')}
            pending={isSubmitting}
            disabled={isSubmitting}
            onPress={() => form.handleSubmit()}
          />
        )}
      </form.Subscribe>
    </AuthPageLayout>
  );
}
