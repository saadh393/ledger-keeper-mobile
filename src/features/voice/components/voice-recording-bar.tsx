import { ArrowUp, X } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Text } from '@/components/ui';
import { AiBarIconButton } from '@/features/assistant/components/ai-bar-icon-button';
import { VoiceWaveform } from '@/features/voice/components/voice-waveform';
import { formatVoiceDuration } from '@/features/voice/utils/format-voice-duration';
import { formatNumber } from '@/lib/format/number';
import { resolveLanguage } from '@/lib/i18n/resolve-language';

export type VoiceRecordingBarProps = {
  elapsedSeconds: number;
  maxSeconds: number | null;
  hitLimit: boolean;
  level: number;
  credits: number | null;
  canSend: boolean;
  onDiscard: () => void;
  onSend: () => void;
};

export function VoiceRecordingBar({ elapsedSeconds, maxSeconds, hitLimit, level, credits, canSend, onDiscard, onSend }: VoiceRecordingBarProps) {
  const { t, i18n } = useTranslation();
  const locale = resolveLanguage(i18n.language);
  const timer = maxSeconds === null
    ? formatVoiceDuration(elapsedSeconds, locale)
    : t('voice.timer', { elapsed: formatVoiceDuration(elapsedSeconds, locale), max: formatVoiceDuration(maxSeconds, locale) });

  return (
    <View testID="voice-recording-bar" className="absolute inset-0 flex-row items-center gap-2 rounded-[32px] bg-surface-container p-1.5">
      <AiBarIconButton testID="voice-discard" icon={X} label={t('voice.discard')} onPress={onDiscard} />
      <View accessibilityLiveRegion="polite">
        <Text testID="voice-timer" className="text-meta text-ink-900" style={{ fontVariant: ['tabular-nums'] }}>
          {hitLimit ? t('voice.limitReached') : timer}
        </Text>
        {credits === null ? null : <Text testID="voice-credits" className="text-meta text-ink-500">{t('voice.credits', { credits: formatNumber(credits, locale) })}</Text>}
      </View>
      <VoiceWaveform level={level} />
      <AiBarIconButton testID="voice-send" icon={ArrowUp} label={t('voice.send')} onPress={onSend} disabled={!canSend} accent />
    </View>
  );
}
