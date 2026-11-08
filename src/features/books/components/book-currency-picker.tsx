import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CurrencyList, filterCurrencies, getOrderedCurrencies } from '@/features/currency';

export type BookCurrencyPickerProps = {
  selected: string;
  defaultCurrency: string;
  onSelect: (code: string) => void;
  onBack: () => void;
};

export function BookCurrencyPicker({ selected, defaultCurrency, onSelect, onBack }: BookCurrencyPickerProps) {
  const { t } = useTranslation();
  const [query, setQuery] = React.useState('');
  const currencies = React.useMemo(
    () => filterCurrencies(getOrderedCurrencies(defaultCurrency), query),
    [defaultCurrency, query],
  );

  return (
    <View className="flex-1">
      <Input
        testID="book-currency-search"
        placeholder={t('books.form.searchCurrency')}
        value={query}
        onChangeText={setQuery}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        containerClassName="mb-2"
      />
      <CurrencyList
        filteredCurrencies={currencies}
        selectedCurrency={selected}
        onSelect={onSelect}
        testID="book-currency"
      />
      <Button
        variant="secondary"
        label={t('books.form.back')}
        onPress={onBack}
        className="mt-3"
        testID="book-currency-back"
      />
    </View>
  );
}
