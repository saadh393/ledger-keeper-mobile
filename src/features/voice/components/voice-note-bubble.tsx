import type { VoiceArtifactData } from '@/features/voice/schemas/voice-artifact-schema';
import { Mic } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Text } from '@/components/ui';
import { formatVoiceDuration } from '@/features/voice/utils/format-voice-duration';
import { resolveLanguage } from '@/lib/i18n/resolve-language';
import { useThemeColors } from '@/lib/theme/use-theme-colors';

const noticeKeys: Partial<Record<VoiceArtifactData['state'], string>> = {
  no_speech: 'voice.noSpeech',
  failed: 'voice.failed',
};

export function VoiceNoteBubble({ voice }: { voice: VoiceArtifactData }) {
  const { t, i18n } = useTranslation();
  const themeColors = useThemeColors();
  const noticeKey = noticeKeys[voice.state];
  const body = voice.state === 'transcribed' ? voice.transcript : noticeKey && t(noticeKey);

  return (
    <View testID="voice-note" className="max-w-[85%] rounded-3xl rounded-tr bg-paper-200 px-4 py-2.5">
      <View className="flex-row items-center gap-1.5">
        <Mic size={14} strokeWidth={1.75} color={themeColors['ink-500']} />
        <Text className="text-meta text-ink-500">{t('voice.note', { duration: formatVoiceDuration(voice.durationSeconds, resolveLanguage(i18n.language)) })}</Text>
      </View>
      {body ? <Text selectable className={`mt-1 text-body ${noticeKey ? 'text-ink-500' : 'text-ink-900'}`}>{body}</Text> : null}
    </View>
  );
}
