import type { CurrencyItem } from '@/features/currency/data/currencies';
import type { UserProfile } from '@/features/currency/types';

import { Book, Check } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, View } from 'react-native';

import {
  BottomSheet,
  BottomSheetFlatList,
  useBottomSheetModalRef,
} from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { ToneTile } from '@/components/ui/tone-tile';
import { useAuthStore } from '@/features/auth';
import {
  useUpdateDefaultCurrency,
  useUserProfile,
} from '@/features/currency/api/use-user-profile';
import {
  filterCurrencies,
  getOrderedCurrencies,
} from '@/features/currency/utils/currency-list';
import { translate } from '@/lib/i18n';
import { useThemeColors } from '@/lib/theme/use-theme-colors';

export type CurrencyPickerSheetProps = {
  profile?: UserProfile;
  onSuccess?: () => void;
  testID?: string;
};

type CurrencyRowProps = {
  item: CurrencyItem;
  isSelected: boolean;
  onSelect: (code: string) => void;
  testID?: string;
};

function CurrencyRow({ item, isSelected, onSelect, testID }: CurrencyRowProps) {
  const themeColors = useThemeColors();

  return (
    <Pressable
      testID={testID ? `${testID}-item-${item.code}` : `currency-item-${item.code}`}
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, ${item.code}, ${item.symbol}`}
      accessibilityState={{ selected: isSelected }}
      onPress={() => onSelect(item.code)}
      className={`my-0.5 min-h-[48px] flex-row items-center rounded-2xl px-3 py-2.5 ${
        isSelected ? 'bg-selected' : 'active:bg-paper-200'
      }`}
    >
      <Text
        className={`w-12 text-row-title font-semibold ${
          isSelected ? 'text-on-selected' : 'text-ink-900'
        }`}
      >
        {item.code}
      </Text>
      <Text
        numberOfLines={1}
        className={`flex-1 text-row-title ${
          isSelected ? 'font-medium text-on-selected' : 'text-ink-700'
        }`}
      >
        {item.name}
      </Text>
      <Text
        className={`mr-3 text-row-title font-medium ${
          isSelected ? 'text-on-selected' : 'text-ink-500'
        }`}
      >
        {item.symbol}
      </Text>
      <View className="w-5 items-center justify-center">
        {isSelected
          ? (
              <Check size={18} strokeWidth={2.2} color={themeColors.link} />
            )
          : null}
      </View>
    </Pressable>
  );
}

function CurrencyPickerHeader({ testID }: { testID?: string }) {
  return (
    <View className="mb-3 flex-row items-start gap-3">
      <ToneTile tone="info" icon={Book} size={40} />
      <View className="flex-1">
        <Text
          testID={testID ? `${testID}-title` : undefined}
          className="text-title font-medium text-ink-900"
          tx="currency.pickerTitle"
        />
        <Text
          testID={testID ? `${testID}-subtitle` : undefined}
          className="mt-0.5 text-label leading-5 text-ink-500"
          tx="currency.pickerSubtitle"
        />
      </View>
    </View>
  );
}

type CurrencyPickerListProps = {
  filteredCurrencies: CurrencyItem[];
  selectedCurrency: string;
  onSelect: (code: string) => void;
  testID?: string;
};

function CurrencyPickerList({
  filteredCurrencies,
  selectedCurrency,
  onSelect,
  testID,
}: CurrencyPickerListProps) {
  const renderItem = React.useCallback(
    ({ item }: { item: CurrencyItem }) => (
      <CurrencyRow
        item={item}
        isSelected={item.code === selectedCurrency}
        onSelect={onSelect}
        testID={testID}
      />
    ),
    [selectedCurrency, testID, onSelect],
  );

  return (
    <View className="min-h-[160px] flex-1">
      {filteredCurrencies.length === 0
        ? (
            <View
              testID={testID ? `${testID}-empty` : undefined}
              className="flex-1 items-center justify-center py-8"
            >
              <Text
                className="text-center text-body text-ink-500"
                tx="currency.noCurrencyFound"
              />
            </View>
          )
        : (
            <BottomSheetFlatList
              testID={testID ? `${testID}-list` : undefined}
              data={filteredCurrencies}
              keyExtractor={(item: CurrencyItem) => item.code}
              renderItem={renderItem}
              keyboardShouldPersistTaps="handled"
              initialNumToRender={15}
              maxToRenderPerBatch={20}
              windowSize={5}
            />
          )}
    </View>
  );
}

type CurrencyPickerFooterProps = {
  isError: boolean;
  isPending: boolean;
  selectedCurrency: string;
  onRetry: () => void;
  onSave: () => void;
  onSignOut: () => void;
  testID?: string;
};

function CurrencyPickerFooter({
  isError,
  isPending,
  selectedCurrency,
  onRetry,
  onSave,
  onSignOut,
  testID,
}: CurrencyPickerFooterProps) {
  return (
    <View className="mt-3 gap-2">
      {isError && (
        <View
          testID={testID ? `${testID}-error-banner` : undefined}
          className="flex-row items-center justify-between rounded-xl bg-clay-100 px-3 py-2"
        >
          <Text
            className="mr-2 flex-1 text-label text-clay-500"
            tx="currency.saveError"
          />
          <Button
            variant="destructive"
            size="compact"
            label={translate('currency.retry')}
            onPress={onRetry}
            testID={testID ? `${testID}-retry-button` : undefined}
          />
        </View>
      )}

      <Button
        variant="primary"
        fullWidth
        label={
          isPending
            ? translate('currency.saving')
            : translate('currency.continue')
        }
        loading={isPending}
        disabled={isPending || !selectedCurrency}
        onPress={onSave}
        testID={testID ? `${testID}-continue-button` : undefined}
      />

      <Button
        variant="text"
        fullWidth
        label={translate('currency.signOut')}
        disabled={isPending}
        onPress={onSignOut}
        testID={testID ? `${testID}-sign-out-button` : undefined}
      />
    </View>
  );
}

export function CurrencyPickerSheet({
  profile: profileProp,
  onSuccess,
  testID = 'currency-picker-sheet',
}: CurrencyPickerSheetProps = {}) {
  const { data: fetchedProfile } = useUserProfile();
  const profile = profileProp !== undefined ? profileProp : fetchedProfile;

  const [dismissed, setDismissed] = React.useState(false);
  const [userSelectedCurrency, setUserSelectedCurrency] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');

  const selectedCurrency = userSelectedCurrency ?? profile?.currency ?? 'BDT';
  const modal = useBottomSheetModalRef();
  const signOut = useAuthStore(state => state.signOut);

  const shouldShow = Boolean(profile && !profile.currencyConfirmed && !dismissed);

  React.useEffect(() => {
    if (shouldShow) {
      modal.present();
    }
    else {
      modal.dismiss();
    }
  }, [shouldShow, modal]);

  const updateCurrencyMutation = useUpdateDefaultCurrency();

  const orderedCurrencies = React.useMemo(() => {
    return getOrderedCurrencies(profile?.currency);
  }, [profile?.currency]);

  const filteredCurrencies = React.useMemo(() => {
    return filterCurrencies(orderedCurrencies, searchQuery);
  }, [orderedCurrencies, searchQuery]);

  const handleSelect = React.useCallback((code: string) => {
    setUserSelectedCurrency(code);
  }, []);

  const handleSave = React.useCallback(() => {
    if (!selectedCurrency || updateCurrencyMutation.isPending) {
      return;
    }

    updateCurrencyMutation.mutate(selectedCurrency, {
      onSuccess: () => {
        setDismissed(true);
        modal.dismiss();
        onSuccess?.();
      },
    });
  }, [selectedCurrency, updateCurrencyMutation, modal, onSuccess]);

  const snapPoints = React.useMemo(() => ['85%'], []);

  if (!shouldShow) {
    return null;
  }

  return (
    <BottomSheet
      ref={modal.ref}
      index={0}
      snapPoints={snapPoints}
      dismissible={false}
      showCloseButton={false}
      testID={testID}
    >
      <View testID={testID} className="flex-1 px-4 pb-4">
        <CurrencyPickerHeader testID={testID} />

        <View className="mb-2">
          <Input
            testID={`${testID}-search-input`}
            placeholder={translate('currency.searchPlaceholder')}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
            clearButtonMode="while-editing"
            containerClassName="mb-0"
          />
        </View>

        <CurrencyPickerList
          filteredCurrencies={filteredCurrencies}
          selectedCurrency={selectedCurrency}
          onSelect={handleSelect}
          testID={testID}
        />

        <CurrencyPickerFooter
          isError={updateCurrencyMutation.isError}
          isPending={updateCurrencyMutation.isPending}
          selectedCurrency={selectedCurrency}
          onRetry={handleSave}
          onSave={handleSave}
          onSignOut={signOut}
          testID={testID}
        />
      </View>
    </BottomSheet>
  );
}
