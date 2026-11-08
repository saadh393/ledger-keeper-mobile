import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { FocusAwareStatusBar, SafeAreaView, Text } from '@/components/ui';
import { EmailPasswordForm } from '@/features/auth/components/email-password-form';
import { Logo } from '@/features/auth/components/logo';

export function AuthScreen() {
  const { t } = useTranslation();

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

            <EmailPasswordForm />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
