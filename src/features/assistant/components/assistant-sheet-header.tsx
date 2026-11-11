import { ArrowLeft, History, Sparkles, SquarePen, X } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Text } from '@/components/ui';
import { useOpenChat } from '@/features/assistant/api/use-open-chat';
import { AssistantHeaderButton } from '@/features/assistant/components/assistant-header-button';
import { useAssistantStore } from '@/features/assistant/store/use-assistant-store';
import { useThemeColors } from '@/lib/theme/use-theme-colors';

export type AssistantSheetHeaderProps = {
  title: string;
  onClose: () => void;
};

export function AssistantSheetHeader({ title, onClose }: AssistantSheetHeaderProps) {
  const { t } = useTranslation();
  const themeColors = useThemeColors();
  const view = useAssistantStore(state => state.view);
  const setView = useAssistantStore(state => state.setView);
  const isSending = useAssistantStore(state => state.pending?.failure === null);
  const openChat = useOpenChat();
  const isHistory = view === 'history';

  return (
    <View className="min-h-[44px] flex-row items-center gap-2 px-4 pb-2">
      {isHistory
        ? <AssistantHeaderButton testID="assistant-history-back" icon={ArrowLeft} label={t('assistant.history.back')} onPress={() => setView('thread')} />
        : <Sparkles size={20} strokeWidth={1.75} color={themeColors.link} />}
      <Text testID="assistant-sheet-title" numberOfLines={1} className="flex-1 text-title font-medium text-ink-900">
        {isHistory ? t('assistant.history.title') : title}
      </Text>
      {isHistory
        ? null
        : (
            <>
              <AssistantHeaderButton testID="assistant-history-open" icon={History} label={t('assistant.history.open')} disabled={isSending} onPress={() => setView('history')} />
              <AssistantHeaderButton testID="assistant-new-chat" icon={SquarePen} label={t('assistant.history.newChat')} disabled={isSending} onPress={() => openChat(null)} />
            </>
          )}
      <AssistantHeaderButton testID="assistant-sheet-close" icon={X} label={t('assistant.sheet.close')} onPress={onClose} />
    </View>
  );
}
