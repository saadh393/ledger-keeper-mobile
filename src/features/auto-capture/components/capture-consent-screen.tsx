import { useRouter } from 'expo-router';
import { Bell } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Text, ToneTile } from '@/components/ui';
import { ConsentSection } from '@/features/auto-capture/components/consent-section';
import { useBackTo } from '@/features/auto-capture/hooks/use-back-to';
import { useOnAppActive } from '@/features/auto-capture/hooks/use-on-app-active';
import { notificationCapture } from '@/features/auto-capture/native/notification-capture';
import { PrivacyPolicyLink } from '@/features/legal/components/privacy-policy-link';

const sections = ['why', 'read', 'never', 'where', 'off'] as const;

export function CaptureConsentScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [awaitingAccess, setAwaitingAccess] = React.useState(false);
  const [stillOff, setStillOff] = React.useState(false);
  useBackTo('/settings');

  const chooseApps = React.useCallback(() => {
    setAwaitingAccess(false);
    setStillOff(false);
    router.push({ pathname: '/auto-capture-apps', params: { flow: 'enable' } });
  }, [router]);

  useOnAppActive(async () => {
    if (!awaitingAccess)
      return;
    if (await notificationCapture.isAccessGranted())
      chooseApps();
    else
      setStillOff(true);
  });

  const onContinue = async () => {
    if (await notificationCapture.isAccessGranted()) {
      chooseApps();
      return;
    }
    setAwaitingAccess(true);
    await notificationCapture.openAccessSettings();
  };

  return (
    <View testID="capture-consent-screen" className="flex-1 bg-paper-100">
      <ScrollView contentContainerClassName="gap-5 px-4 pt-4 pb-6">
        <ToneTile tone="info" icon={Bell} size={48} />
        <Text accessibilityRole="header" className="text-headline text-ink-900">{t('autoCapture.consent.title')}</Text>
        {sections.map(key => (
          <ConsentSection key={key} title={t(`autoCapture.consent.${key}.title`)} body={t(`autoCapture.consent.${key}.body`)} />
        ))}
        <PrivacyPolicyLink />
      </ScrollView>
      <View className="gap-2 border-t border-border px-4 pt-3" style={{ paddingBottom: insets.bottom + 12 }}>
        {stillOff ? <Text testID="capture-consent-still-off" accessibilityRole="alert" className="text-center text-meta text-clay-500">{t('autoCapture.consent.stillOff')}</Text> : null}
        <Button testID="capture-consent-continue" label={t('autoCapture.consent.continue')} onPress={onContinue} />
        <Button testID="capture-consent-not-now" variant="text" label={t('autoCapture.consent.notNow')} onPress={() => router.navigate('/settings')} />
      </View>
    </View>
  );
}
