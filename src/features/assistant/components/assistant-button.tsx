import { Sparkles } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';
import { Text } from '@/components/ui';
import { useAssistantStore } from '@/features/assistant/store/use-assistant-store';
import { useThemeColors } from '@/lib/theme/use-theme-colors';

export function AssistantButton() {
  const { t } = useTranslation();
  const themeColors = useThemeColors();
  const open = useAssistantStore(state => state.open);

  return (
    <Pressable
      testID="assistant-button"
      accessibilityRole="button"
      accessibilityLabel={t('assistant.sheet.open')}
      onPress={open}
      hitSlop={4}
      className="h-9 flex-row items-center gap-1.5 rounded-full bg-surface-container px-3 active:bg-paper-200"
    >
      <Sparkles size={16} strokeWidth={1.75} color={themeColors.link} />
      <Text className="text-label text-ink-900">{t('assistant.sheet.title')}</Text>
    </Pressable>
  );
}
