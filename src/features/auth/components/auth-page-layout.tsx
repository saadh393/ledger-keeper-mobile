import * as React from 'react';
import { BackHandler, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { FocusAwareStatusBar, SafeAreaView, Text } from '@/components/ui';

export type AuthPageLayoutProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onBack: () => void;
  testID?: string;
};

export function AuthPageLayout({ title, subtitle, children, onBack, testID }: AuthPageLayoutProps) {
  React.useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onBack();
      return true;
    });
    return () => subscription.remove();
  }, [onBack]);

  return (
    <SafeAreaView testID={testID} style={{ flex: 1 }} className="flex-1 bg-paper-100">
      <FocusAwareStatusBar />
      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 32 }}
        keyboardShouldPersistTaps="handled"
        bottomOffset={32}
      >
        <View className="w-full max-w-sm self-center">
          <Text className="mb-2 text-headline text-ink-900">{title}</Text>
          {subtitle ? <Text className="mb-6 text-body text-ink-700">{subtitle}</Text> : null}
          {children}
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
