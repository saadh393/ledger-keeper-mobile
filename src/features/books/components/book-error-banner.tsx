import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

export type BookErrorBannerProps = {
  message: string;
  onRetry?: () => void;
  testID?: string;
};

export function BookErrorBanner({ message, onRetry, testID = 'book-error-banner' }: BookErrorBannerProps) {
  const { t } = useTranslation();

  return (
    <View
      testID={testID}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      className="mb-3 flex-row items-center justify-between rounded-xl bg-clay-100 px-3 py-2"
    >
      <Text testID={`${testID}-message`} className="mr-2 flex-1 text-label text-clay-500">
        {message}
      </Text>
      {onRetry && (
        <Button
          variant="destructive"
          size="compact"
          fullWidth={false}
          label={t('books.retry')}
          onPress={onRetry}
          testID={`${testID}-retry`}
        />
      )}
    </View>
  );
}
