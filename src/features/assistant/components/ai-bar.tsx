import type { ReceiptImage } from '@/features/receipts/types';
import type { VoiceRecorderStatus, VoiceRecording } from '@/features/voice/utils/voice-recorder-reducer';
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
import { getChatCredits, getReceiptLimit, getVoiceCredits, getVoiceLimit, useRateCard } from '@/features/credits';
import { ReceiptEditor } from '@/features/receipts/components/receipt-editor';
import { ReceiptNotice } from '@/features/receipts/components/receipt-notice';
import { ReceiptSourceSheet } from '@/features/receipts/components/receipt-source-sheet';
import { useReceiptCapture } from '@/features/receipts/hooks/use-receipt-capture';
import { VoiceNotice } from '@/features/voice/components/voice-notice';
import { VoiceRecordingBar } from '@/features/voice/components/voice-recording-bar';
import { useVoiceInput } from '@/features/voice/hooks/use-voice-input';
import { useThemeColors } from '@/lib/theme/use-theme-colors';

export type AiBarProps = {
  onSend: (text: string) => void;
  onReceipt: (image: ReceiptImage) => void;
  onRecording: (recording: VoiceRecording) => boolean;
};

const recordingStatuses: VoiceRecorderStatus[] = ['requesting-permission', 'recording', 'stopped'];

export function AiBar({ onSend, onReceipt, onRecording }: AiBarProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const themeColors = useThemeColors();
  const rateCard = useRateCard();
  const text = useAssistantStore(state => state.draft);
  const setText = useAssistantStore(state => state.setDraft);
  const isSending = useAssistantStore(state => state.pending?.failure === null);
  const isVoiceDisabled = useAssistantStore(state => Boolean(state.pending?.voice) && state.pending?.failure?.reason === 'disabled');
  const voice = useVoiceInput(onRecording);
  const receipt = useReceiptCapture(onReceipt);
  const trimmed = text.trim();
  const maxChars = rateCard.data?.limits.maxMessageChars;
  const chatCredits = rateCard.data ? getChatCredits(rateCard.data) : undefined;
  const isChatOff = chatCredits === null;
  const limit = getMessageLimit(trimmed.length, maxChars);
  const canSend = Boolean(trimmed) && !limit.isOverLimit && !isChatOff && !isSending;
  const isVoiceOff = isVoiceDisabled || Boolean(rateCard.data && getVoiceLimit(rateCard.data) === null);
  const voiceNotice = isVoiceOff ? 'voice-unavailable' : voice.status === 'error' ? voice.reason : null;
  const receiptLimit = getReceiptLimit(rateCard.data);
  const isReceiptOff = Boolean(rateCard.data) && receiptLimit === null;
  const receiptNotice = receipt.error ?? (isReceiptOff ? 'unavailable' : null);

  const send = () => {
    onSend(trimmed);
    setText('');
  };

  return (
    <KeyboardStickyView offset={{ closed: 0, opened: insets.bottom }}>
      <View testID="ai-bar" className="bg-paper-100 px-4 pt-2" style={{ paddingBottom: insets.bottom + 8 }}>
        <View className="relative min-h-[56px] flex-row items-end rounded-[32px] bg-surface-container p-1.5">
          <AiBarIconButton
            testID="ai-bar-camera"
            icon={Camera}
            label={t(isReceiptOff ? 'receipts.unavailable' : 'assistant.bar.camera')}
            onPress={receipt.open}
            disabled={receiptLimit === null || receipt.step !== 'idle'}
          />
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
          <AiBarIconButton
            testID="ai-bar-mic"
            icon={Mic}
            label={t(isVoiceOff ? 'voice.unavailable' : 'assistant.bar.mic')}
            onPress={voice.tap}
            onLongPress={voice.hold}
            onPressOut={voice.release}
            disabled={isChatOff || isVoiceOff || isSending}
          />
          <AiBarIconButton testID="ai-bar-send" icon={ArrowUp} label={t('assistant.bar.send')} onPress={send} disabled={!canSend} accent />
          {recordingStatuses.includes(voice.status)
            ? (
                <VoiceRecordingBar
                  elapsedSeconds={voice.elapsedSeconds}
                  maxSeconds={voice.maxSeconds}
                  hitLimit={voice.hitLimit}
                  level={voice.level}
                  credits={rateCard.data ? getVoiceCredits(rateCard.data, voice.elapsedSeconds) : null}
                  canSend={voice.status === 'recording' || Boolean(voice.recording)}
                  onDiscard={voice.discard}
                  onSend={voice.send}
                />
              )
            : null}
        </View>
        <View className="mt-1.5 flex-row items-center px-2">
          {voiceNotice && !isChatOff
            ? <VoiceNotice reason={voiceNotice} />
            : receiptNotice && !isChatOff
              ? <ReceiptNotice reason={receiptNotice} />
              : <AiBarHint chatCredits={chatCredits} />}
          {limit.showCounter && maxChars
            ? <AiBarCounter count={trimmed.length} max={maxChars} isOverLimit={limit.isOverLimit} />
            : null}
        </View>
      </View>
      {receipt.step === 'choosing' ? <ReceiptSourceSheet onSelect={receipt.choose} onDismiss={receipt.dismiss} /> : null}
      {receipt.source && receiptLimit !== null
        ? <ReceiptEditor source={receipt.source} maxBytes={receiptLimit} onReady={receipt.finish} onCancel={receipt.cancel} />
        : null}
    </KeyboardStickyView>
  );
}
