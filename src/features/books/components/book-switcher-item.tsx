import type { Book } from '@/features/books/schemas/book-schema';
import { Check } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { Text } from '@/components/ui';
import { useThemeColors } from '@/lib/theme/use-theme-colors';

export type BookSwitcherItemProps = {
  book: Book;
  isActive: boolean;
  onSelect: (book: Book) => void;
  testID?: string;
};

export function BookSwitcherItem({
  book,
  isActive,
  onSelect,
  testID,
}: BookSwitcherItemProps) {
  const { t } = useTranslation();
  const themeColors = useThemeColors();
  const defaultLabel = t('books.default');

  const accessibilityLabel = `${book.name}, ${book.currency}${
    book.isDefault ? `, ${defaultLabel}` : ''
  }`;

  return (
    <Pressable
      testID={testID ?? `book-item-${book.id}`}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected: isActive }}
      onPress={() => onSelect(book)}
      className={`my-0.5 min-h-[48px] flex-row items-center rounded-2xl px-3 py-2.5 ${
        isActive ? 'bg-selected' : 'bg-transparent active:bg-paper-200'
      }`}
    >
      {/* Book name */}
      <Text
        numberOfLines={1}
        ellipsizeMode="tail"
        testID={`book-item-name-${book.id}`}
        className={`flex-1 text-row-title ${
          isActive ? 'font-medium text-on-selected' : 'text-ink-900'
        }`}
      >
        {book.name}
      </Text>

      {/* Default badge if isDefault */}
      {book.isDefault && (
        <View
          testID={`book-item-default-${book.id}`}
          className="mx-2 rounded-full bg-paper-200 px-2.5 py-0.5"
        >
          <Text className="text-meta font-medium text-ink-700">
            {defaultLabel}
          </Text>
        </View>
      )}

      {/* Currency code */}
      <Text
        testID={`book-item-currency-${book.id}`}
        className={`mr-3 text-row-title font-medium tabular-nums ${
          isActive ? 'text-on-selected' : 'text-ink-500'
        }`}
      >
        {book.currency}
      </Text>

      {/* Active check mark */}
      <View className="w-5 items-center justify-center">
        {isActive && (
          <View testID={`book-item-check-${book.id}`}>
            <Check
              size={18}
              strokeWidth={2.2}
              color={themeColors.link}
            />
          </View>
        )}
      </View>
    </Pressable>
  );
}
