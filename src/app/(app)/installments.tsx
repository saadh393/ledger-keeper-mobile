import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { SectionPlaceholder } from '@/features/navigation';

export default function InstallmentsScreen() {
  const { t } = useTranslation();
  return <SectionPlaceholder title={t('navigation.installments')} />;
}
