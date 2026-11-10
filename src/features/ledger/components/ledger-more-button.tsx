import { useRouter } from 'expo-router';
import { EllipsisVertical } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';
import { LedgerMoreMenuSheet } from '@/features/ledger/components/ledger-more-menu-sheet';
import { useThemeColors } from '@/lib/theme/use-theme-colors';

export function LedgerMoreButton() {
  const { t } = useTranslation();
  const router = useRouter();
  const themeColors = useThemeColors();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <Pressable
        testID="ledger-more-button"
        accessibilityRole="button"
        accessibilityLabel={t('ledger.more.label')}
        onPress={() => setIsOpen(true)}
        className="size-11 items-center justify-center rounded-full active:bg-paper-200"
        hitSlop={8}
      >
        <EllipsisVertical size={24} strokeWidth={1.75} color={themeColors['ink-900']} />
      </Pressable>
      {isOpen
        ? <LedgerMoreMenuSheet onManageCategories={() => router.push('/categories')} onDismiss={() => setIsOpen(false)} />
        : null}
    </>
  );
}
