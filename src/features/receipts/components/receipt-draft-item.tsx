import type { ReceiptItemValues } from '@/features/receipts/utils/receipt-draft-values';
import { Trash2 } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { Input, Select } from '@/components/ui';
import { useThemeColors } from '@/lib/theme/use-theme-colors';

export type ReceiptDraftItemProps = {
  item: ReceiptItemValues;
  index: number;
  categories: string[];
  canRemove: boolean;
  disabled: boolean;
  onChange: (item: ReceiptItemValues) => void;
  onRemove: () => void;
};

export function ReceiptDraftItem({ item, index, categories, canRemove, disabled, onChange, onRemove }: ReceiptDraftItemProps) {
  const { t } = useTranslation();
  const themeColors = useThemeColors();
  const number = index + 1;
  const options = [...new Set([...categories, item.category].filter(Boolean))].map(name => ({ label: name, value: name }));
  const set = (key: keyof ReceiptItemValues) => (value: string) => onChange({ ...item, [key]: value });

  return (
    <View testID={`receipt-item-${index}`} className="mb-3 rounded-2xl border border-dashed border-wheat-500 p-2.5">
      <View className="flex-row items-start gap-2">
        <Input
          testID={`receipt-item-${index}-title`}
          accessibilityLabel={t('receipts.draft.itemLabel', { number })}
          placeholder={t('receipts.draft.item')}
          value={item.title}
          onChangeText={set('title')}
          disabled={disabled}
          maxLength={200}
          className="bg-paper-100"
          containerClassName="mb-2 flex-1"
        />
        <Pressable
          testID={`receipt-item-${index}-remove`}
          accessibilityRole="button"
          accessibilityLabel={t('receipts.draft.remove', { number })}
          disabled={disabled || !canRemove}
          onPress={onRemove}
          className={`size-11 items-center justify-center rounded-full ${disabled || !canRemove ? 'opacity-40' : ''}`}
        >
          <Trash2 size={18} strokeWidth={1.75} color={themeColors['ink-500']} />
        </Pressable>
      </View>
      <Select
        testID={`receipt-item-${index}-category`}
        placeholder={t('assistant.draft.categoryPlaceholder')}
        value={item.category || undefined}
        options={options}
        onSelect={value => set('category')(String(value))}
        disabled={disabled}
      />
      <View className="flex-row gap-2">
        <Input
          testID={`receipt-item-${index}-quantity`}
          accessibilityLabel={t('receipts.draft.quantity')}
          placeholder={t('receipts.draft.quantity')}
          value={item.quantity}
          onChangeText={set('quantity')}
          keyboardType="decimal-pad"
          disabled={disabled}
          className="bg-paper-100 tabular-nums"
          containerClassName="mb-0 w-20"
        />
        <Input
          testID={`receipt-item-${index}-amount`}
          accessibilityLabel={t('assistant.draft.amount')}
          placeholder="0"
          value={item.amount}
          onChangeText={set('amount')}
          keyboardType="decimal-pad"
          disabled={disabled}
          className="bg-paper-100 text-right tabular-nums"
          containerClassName="mb-0 flex-1"
        />
      </View>
    </View>
  );
}
