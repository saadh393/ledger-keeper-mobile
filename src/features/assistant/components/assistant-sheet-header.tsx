import { Sparkles, X } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { Text } from '@/components/ui';
import { useThemeColors } from '@/lib/theme/use-theme-colors';

export type AssistantSheetHeaderProps = {
  title: string;
  onClose: () => void;
};

export function AssistantSheetHeader({ title, onClose }: AssistantSheetHeaderProps) {
  const { t } = useTranslation();
  const themeColors = useThemeColors();

  return (
    <View className="min-h-[44px] flex-row items-center gap-2 px-4 pb-2">
      <Sparkles size={20} strokeWidth={1.75} color={themeColors.link} />
      <Text testID="assistant-sheet-title" numberOfLines={1} className="flex-1 text-title font-medium text-ink-900">
        {title}
      </Text>
      <View className="w-[88px]" />
      <Pressable
        testID="assistant-sheet-close"
        accessibilityRole="button"
        accessibilityLabel={t('assistant.sheet.close')}
        onPress={onClose}
        hitSlop={8}
        className="size-11 items-center justify-center rounded-full active:bg-paper-200"
      >
        <X size={20} strokeWidth={1.75} color={themeColors['ink-500']} />
      </Pressable>
    </View>
  );
}
