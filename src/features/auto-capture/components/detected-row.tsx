import type { DetectedItem } from '@/features/auto-capture/schemas/detected-item-schema';
import type { Language } from '@/lib/i18n/resources';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { Button, Text } from '@/components/ui';
import { CaptureAppIcon } from '@/features/auto-capture/components/capture-app-icon';
import { canConfirmDetected } from '@/features/auto-capture/utils/can-confirm-detected';
import { formatDate, formatDateTime } from '@/lib/format/date';
import { formatSignedCurrency } from '@/lib/format/signed-currency';

export type DetectedRowProps = {
  item: DetectedItem;
  locale: Language;
  pending: boolean;
  expanded: boolean;
  onToggle: (item: DetectedItem) => void;
  onConfirm: (item: DetectedItem) => void;
  onEdit: (item: DetectedItem) => void;
  onDiscard: (item: DetectedItem) => void;
};

export function DetectedRow({ item, locale, pending, expanded, onToggle, onConfirm, onEdit, onDiscard }: DetectedRowProps) {
  const { t } = useTranslation();
  const empty = t('autoCapture.inbox.missing');
  const amount = item.amount !== null && item.kind ? formatSignedCurrency(item.amount, locale, { kind: item.kind, currency: item.currency }) : empty;

  return (
    <View testID={`detected-row-${item.id}`} className="mx-4 my-1.5 gap-2 rounded-2xl border border-wheat-500/40 bg-wheat-200 p-3">
      <Pressable accessibilityRole="button" accessibilityState={{ expanded }} onPress={() => onToggle(item)} className="flex-row items-center gap-3">
        <CaptureAppIcon packageName={item.packageName} />
        <View className="min-w-0 flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="rounded-full bg-wheat-500 px-2 text-meta text-ink-900">{t('autoCapture.inbox.detected')}</Text>
            <Text numberOfLines={1} className="flex-1 text-meta text-ink-500">{`${item.appName} · ${formatDateTime(item.receivedAt, locale)}`}</Text>
          </View>
          <Text testID="detected-row-title" numberOfLines={1} className="text-row-title text-ink-900">{item.title || empty}</Text>
        </View>
        <Text testID="detected-row-amount" className={item.kind === 'income' ? 'text-row-title text-forest-500' : 'text-row-title text-ink-900'} style={{ fontVariant: ['tabular-nums'] }}>{amount}</Text>
      </Pressable>
      {item.duplicateOf
        ? (
            <Text testID="detected-row-duplicate" className="text-meta text-clay-500">
              {t('autoCapture.inbox.duplicate', {
                title: item.duplicateOf.title,
                date: formatDate(item.duplicateOf.dateIso, locale),
                amount: formatSignedCurrency(item.duplicateOf.amount, locale, { kind: item.duplicateOf.kind, currency: item.currency }),
              })}
            </Text>
          )
        : null}
      {expanded ? <Text testID="detected-row-source" className="rounded-xl bg-paper-100 p-3 text-body text-ink-700">{item.sourceText}</Text> : null}
      <View className="flex-row justify-end gap-1">
        <Button testID="detected-discard" variant="ghost" size="sm" fullWidth={false} label={t('autoCapture.inbox.discard')} disabled={pending} onPress={() => onDiscard(item)} />
        <Button testID="detected-edit" variant="text" size="sm" fullWidth={false} label={t('autoCapture.inbox.edit')} disabled={pending} onPress={() => onEdit(item)} />
        <Button testID="detected-confirm" size="sm" fullWidth={false} label={t('autoCapture.inbox.confirm')} pending={pending} disabled={pending || !canConfirmDetected(item)} onPress={() => onConfirm(item)} />
      </View>
    </View>
  );
}
