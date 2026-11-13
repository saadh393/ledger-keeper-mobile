import type { VoiceRecorderError } from '@/features/voice/utils/voice-recorder-reducer';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, View } from 'react-native';
import { Button, Text } from '@/components/ui';

const noticeKeys: Record<VoiceRecorderError, string> = {
  'permission-denied': 'voice.permission',
  'permission-blocked': 'voice.permission',
  'voice-unavailable': 'voice.unavailable',
  'too-short': 'voice.tooShort',
  'recording-failed': 'voice.recordingFailed',
};

export function VoiceNotice({ reason }: { reason: VoiceRecorderError }) {
  const { t } = useTranslation();

  return (
    <View testID="voice-notice" className="flex-1 flex-row items-center justify-center gap-2">
      <Text testID="voice-notice-text" className="shrink text-center text-meta text-ink-500">{t(noticeKeys[reason])}</Text>
      {reason === 'permission-blocked'
        ? <Button testID="voice-open-settings" variant="text" size="sm" fullWidth={false} label={t('voice.openSettings')} onPress={() => void Linking.openSettings()} />
        : null}
    </View>
  );
}
