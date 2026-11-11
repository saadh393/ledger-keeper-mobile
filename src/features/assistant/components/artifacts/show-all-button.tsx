import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui';
import { COLLAPSED_ROW_LIMIT } from '@/features/assistant/utils/get-visible-rows';
import { formatNumber } from '@/lib/format/number';
import { resolveLanguage } from '@/lib/i18n/resolve-language';

export type ShowAllButtonProps = {
  count: number;
  showAll: boolean;
  onPress: () => void;
  testID: string;
};

export function ShowAllButton({ count, showAll, onPress, testID }: ShowAllButtonProps) {
  const { t, i18n } = useTranslation();
  if (showAll || count <= COLLAPSED_ROW_LIMIT)
    return null;
  return (
    <Button
      testID={testID}
      variant="text"
      size="sm"
      fullWidth={false}
      label={t('assistant.artifacts.showAll', { total: formatNumber(count, resolveLanguage(i18n.language)) })}
      onPress={onPress}
    />
  );
}
