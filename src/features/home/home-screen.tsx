import { Text, View } from '@/components/ui';
import { CurrencyPickerSheet } from '@/features/currency';

export function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center px-4">
      <Text className="text-center text-headline" tx="home.title" />
      <CurrencyPickerSheet />
    </View>
  );
}
