import { ArrowUp, Camera, Mic } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput, View } from 'react-native';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AiBarCounter } from '@/features/assistant/components/ai-bar-counter';
import { AiBarHint } from '@/features/assistant/components/ai-bar-hint';
import { AiBarIconButton } from '@/features/assistant/components/ai-bar-icon-button';
import { useAssistantStore } from '@/features/assistant/store/use-assistant-store';
import { getMessageLimit } from '@/features/assistant/utils/get-message-limit';
import { getChatCredits, useRateCard } from '@/features/credits';
import { useThemeColors } from '@/lib/theme/use-theme-colors';

export type AiBarProps = {
  onSend: (text: string) => void;
  onCamera: () => void;
  onMic: () => void;
};

export function AiBar({ onSend, onCamera, onMic }: AiBarProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const themeColors = useThemeColors();
  const rateCard = useRateCard();
  const text = useAssistantStore(state => state.draft);
  const setText = useAssistantStore(state => state.setDraft);
  const trimmed = text.trim();
  const maxChars = rateCard.data?.limits.maxMessageChars;
  const chatCredits = rateCard.data ? getChatCredits(rateCard.data) : undefined;
  const isChatOff = chatCredits === null;
  const limit = getMessageLimit(trimmed.length, maxChars);
  const canSend = Boolean(trimmed) && !limit.isOverLimit && !isChatOff;

  const send = () => {
    onSend(trimmed);
    setText('');
  };

  return (
    <KeyboardStickyView offset={{ closed: 0, opened: insets.bottom }}>
      <View testID="ai-bar" className="bg-paper-100 px-4 pt-2" style={{ paddingBottom: insets.bottom + 8 }}>
        <View className="min-h-[56px] flex-row items-end rounded-[32px] bg-surface-container p-1.5">
          <AiBarIconButton testID="ai-bar-camera" icon={Camera} label={t('assistant.bar.camera')} onPress={onCamera} />
          <TextInput
            testID="ai-bar-input"
            value={text}
            onChangeText={setText}
            multiline
            editable={!isChatOff}
            placeholder={t('assistant.bar.placeholder')}
            placeholderTextColor={themeColors['ink-500']}
            accessibilityLabel={t('assistant.bar.inputLabel')}
            className={`max-h-[160px] min-h-[44px] flex-1 px-2 py-[11px] text-body-l text-ink-900 ${isChatOff ? 'opacity-40' : ''}`}
            style={{ textAlignVertical: 'top' }}
          />
          <AiBarIconButton testID="ai-bar-mic" icon={Mic} label={t('assistant.bar.mic')} onPress={onMic} />
          <AiBarIconButton testID="ai-bar-send" icon={ArrowUp} label={t('assistant.bar.send')} onPress={send} disabled={!canSend} accent />
        </View>
        <View className="mt-1.5 flex-row items-center px-2">
          <AiBarHint chatCredits={chatCredits} />
          {limit.showCounter && maxChars
            ? <AiBarCounter count={trimmed.length} max={maxChars} isOverLimit={limit.isOverLimit} />
            : null}
        </View>
      </View>
    </KeyboardStickyView>
  );
}
