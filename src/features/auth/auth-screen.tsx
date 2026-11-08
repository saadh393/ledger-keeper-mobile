import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { BackHandler, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { FocusAwareStatusBar, SafeAreaView, Text } from '@/components/ui';
import { EmailPasswordForm } from '@/features/auth/components/email-password-form';
import { GoogleSignInButton } from '@/features/auth/components/google-sign-in-button';
import { Logo } from '@/features/auth/components/logo';
import { useAuthSessionNotice } from '@/features/auth/use-auth-store';

export function AuthScreen() {
  const { t } = useTranslation();
  const sessionNotice = useAuthSessionNotice();
  const [isGooglePending, setIsGooglePending] = React.useState(false);
  const [isEmailSubmitting, setIsEmailSubmitting] = React.useState(false);

  React.useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      BackHandler.exitApp();
      return true;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <SafeAreaView
      testID="auth-screen"
      style={{ flex: 1 }}
      className="flex-1 bg-paper-100"
    >
      <FocusAwareStatusBar />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          testID="auth-scroll-view"
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingHorizontal: 24,
            paddingVertical: 32,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="w-full max-w-sm self-center">
            <View className="mb-6 items-center">
              <Logo size={48} testID="auth-logo" />
            </View>

            <Text
              testID="auth-headline"
              className="mb-8 text-center text-headline text-ink-900"
            >
              {t('auth.headline')}
            </Text>

            {sessionNotice
              ? (
                  <View
                    testID="auth-session-notice"
                    className="mb-6 rounded-xl border border-clay-500/20 bg-clay-100 p-3"
                  >
                    <Text
                      testID="auth-session-notice-text"
                      className="text-center text-body font-medium text-clay-500"
                    >
                      {sessionNotice}
                    </Text>
                  </View>
                )
              : null}

            <GoogleSignInButton
              disabled={isEmailSubmitting}
              onPendingChange={setIsGooglePending}
            />

            <View testID="auth-divider" className="my-6 flex-row items-center">
              <View className="h-px flex-1 bg-border" />
              <Text testID="auth-divider-text" className="mx-4 text-meta text-ink-500">
                {t('auth.or')}
              </Text>
              <View className="h-px flex-1 bg-border" />
            </View>

            <EmailPasswordForm
              disabled={isGooglePending}
              onSubmittingChange={setIsEmailSubmitting}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
