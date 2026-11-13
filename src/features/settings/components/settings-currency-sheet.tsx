import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheet, Button, Input, Text, useBottomSheetModalRef } from '@/components/ui';
import { useUpdateDefaultCurrency } from '@/features/currency/api/use-user-profile';
import { CurrencyList } from '@/features/currency/components/currency-list';
import { filterCurrencies, getOrderedCurrencies } from '@/features/currency/utils/currency-list';

export type SettingsCurrencySheetProps = {
  currency: string;
  onDismiss: () => void;
};

const snapPoints = ['85%'];

export function SettingsCurrencySheet({ currency, onDismiss }: SettingsCurrencySheetProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const modal = useBottomSheetModalRef();
  const [selected, setSelected] = React.useState(currency);
  const [query, setQuery] = React.useState('');
  const mutation = useUpdateDefaultCurrency();
  const currencies = React.useMemo(() => filterCurrencies(getOrderedCurrencies(currency), query), [currency, query]);

  React.useEffect(() => {
    modal.present();
  }, [modal]);

  const save = () => {
    if (mutation.isPending)
      return;
    if (selected === currency) {
      modal.dismiss();
      return;
    }
    mutation.mutate(selected, {
      onSuccess: () => {
        showMessage({ type: 'success', duration: 3000, message: t('settings.currency.saved', { code: selected }) });
        modal.dismiss();
      },
    });
  };

  return (
    <BottomSheet ref={modal.ref} index={0} snapPoints={snapPoints} title={t('settings.currency.label')} dismissible={!mutation.isPending} onDismiss={onDismiss} testID="settings-currency-sheet">
      <View className="flex-1 px-4" style={{ paddingBottom: insets.bottom + 16 }}>
        <Input
          testID="settings-currency-search"
          placeholder={t('currency.searchPlaceholder')}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          autoCapitalize="none"
          containerClassName="mb-2"
        />
        <CurrencyList filteredCurrencies={currencies} selectedCurrency={selected} onSelect={setSelected} testID="settings-currency" />
        {mutation.isError ? <Text testID="settings-currency-error" accessibilityRole="alert" className="mt-2 text-meta text-clay-500">{t('settings.currency.error')}</Text> : null}
        <Button
          testID="settings-currency-save"
          className="mt-3"
          label={mutation.isPending ? t('settings.currency.saving') : t('settings.currency.save')}
          pending={mutation.isPending}
          disabled={mutation.isPending}
          onPress={save}
        />
      </View>
    </BottomSheet>
  );
}
