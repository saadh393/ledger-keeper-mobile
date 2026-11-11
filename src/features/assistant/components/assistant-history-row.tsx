import type { BookChat } from '@/features/assistant/schemas/conversation-schema';
import { Trash2 } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { Text } from '@/components/ui';
import { useThemeColors } from '@/lib/theme/use-theme-colors';

export type AssistantHistoryRowProps = {
  chat: BookChat;
  date: string;
  isOpen: boolean;
  onOpen: (chat: BookChat) => void;
  onDelete: (chat: BookChat) => void;
};

export function AssistantHistoryRow({ chat, date, isOpen, onOpen, onDelete }: AssistantHistoryRowProps) {
  const { t } = useTranslation();
  const themeColors = useThemeColors();

  return (
    <View testID={`assistant-history-row-${chat.id}`} className={`min-h-12 flex-row items-center gap-1 rounded-2xl pr-1 ${isOpen ? 'bg-selected' : ''}`}>
      <Pressable
        testID={`assistant-history-open-${chat.id}`}
        accessibilityRole="button"
        accessibilityState={{ selected: isOpen }}
        onPress={() => onOpen(chat)}
        className={`min-w-0 flex-1 rounded-2xl px-3 py-2 ${isOpen ? '' : 'active:bg-paper-200'}`}
      >
        <Text numberOfLines={1} className={`text-row-title font-medium ${isOpen ? 'text-on-selected' : 'text-ink-900'}`}>{chat.title}</Text>
        <Text className={`text-meta tabular-nums ${isOpen ? 'text-on-selected' : 'text-ink-500'}`}>{date}</Text>
      </Pressable>
      <Pressable
        testID={`assistant-history-delete-${chat.id}`}
        accessibilityRole="button"
        accessibilityLabel={t('assistant.history.delete', { title: chat.title })}
        onPress={() => onDelete(chat)}
        className="size-11 items-center justify-center rounded-full active:bg-paper-200"
      >
        <Trash2 size={18} strokeWidth={1.75} color={isOpen ? themeColors['on-selected'] : themeColors['ink-500']} />
      </Pressable>
    </View>
  );
}
