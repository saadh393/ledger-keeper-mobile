import type { useDraftAction } from '@/features/assistant/api/use-draft-action';
import type { TransactionDraftArtifactData } from '@/features/assistant/schemas/draft-artifact-schemas';
import type { DraftValues } from '@/features/assistant/utils/draft-confirm-input';
import { Pencil } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Button, Input, Select, Text } from '@/components/ui';
import { ArtifactCard } from '@/features/assistant/components/artifacts/artifact-card';
import { DraftActionError } from '@/features/assistant/components/artifacts/draft-action-error';
import { DraftDateField } from '@/features/assistant/components/artifacts/draft-date-field';
import { DraftKindToggle } from '@/features/assistant/components/artifacts/draft-kind-toggle';
import { isDraftAmountMissing, toDraftConfirmInput } from '@/features/assistant/utils/draft-confirm-input';
import { formatOriginalAmount } from '@/lib/format/original-amount';
import { resolveLanguage } from '@/lib/i18n/resolve-language';

export type DraftEditorCardProps = {
  data: TransactionDraftArtifactData;
  values: DraftValues;
  onChange: (values: DraftValues) => void;
  currency: string;
  action: ReturnType<typeof useDraftAction>;
};

export function DraftEditorCard({ data, values, onChange, currency, action }: DraftEditorCardProps) {
  const { t, i18n } = useTranslation();
  const input = toDraftConfirmInput(values);
  const amountMissing = isDraftAmountMissing(values);
  const disabled = Boolean(action.pending);
  const categories = [...new Set([...data.categories, values.category].filter(Boolean))].map(name => ({ label: name, value: name }));
  const set = <K extends keyof DraftValues>(key: K) => (value: DraftValues[K]) => onChange({ ...values, [key]: value });

  return (
    <ArtifactCard
      testID="draft-editor"
      label={t(amountMissing ? 'assistant.draft.addAmount' : 'assistant.draft.review')}
      icon={Pencil}
      tone="warning"
      footer={(
        <>
          <DraftActionError failed={action.failed} onRetry={action.retry} />
          <View className="w-full flex-row justify-end gap-2">
            <Button
              testID="draft-discard"
              variant="ghost"
              size="sm"
              fullWidth={false}
              label={action.pending === 'dismiss' ? t('assistant.draft.discarding') : t('assistant.draft.discard')}
              disabled={disabled}
              pending={action.pending === 'dismiss'}
              onPress={() => action.run({ type: 'dismiss' })}
            />
            <Button
              testID="draft-save"
              size="sm"
              fullWidth={false}
              label={action.pending === 'confirm' ? t('assistant.draft.saving') : t('assistant.draft.save')}
              disabled={!input || disabled}
              pending={action.pending === 'confirm'}
              onPress={() => input && action.run({ type: 'confirm', input })}
            />
          </View>
        </>
      )}
    >
      <View className="pt-3">
        <DraftKindToggle value={values.kind} onChange={set('kind')} disabled={disabled} />
        <Input
          testID="draft-title"
          label={t('assistant.draft.title')}
          placeholder={t('assistant.draft.titlePlaceholder')}
          value={values.title}
          onChangeText={set('title')}
          disabled={disabled}
          maxLength={200}
          className="bg-paper-100"
        />
        <Select
          testID="draft-category"
          label={t('assistant.draft.category')}
          placeholder={t('assistant.draft.categoryPlaceholder')}
          value={values.category || undefined}
          options={categories}
          onSelect={value => set('category')(String(value))}
          disabled={disabled}
        />
        <Input
          testID="draft-amount"
          label={t('assistant.draft.amount')}
          placeholder="0"
          value={values.amount}
          onChangeText={set('amount')}
          keyboardType="decimal-pad"
          disabled={disabled}
          className="bg-paper-100 tabular-nums"
          containerClassName={data.original ? 'mb-1' : undefined}
          rightAccessory={<Text className="text-body font-medium text-ink-500">{currency}</Text>}
        />
        {data.original
          ? (
              <Text testID="draft-original" className="mb-4 text-meta text-ink-500">
                {t('assistant.draft.original', { original: formatOriginalAmount(data.original, resolveLanguage(i18n.language)) })}
              </Text>
            )
          : null}
        <DraftDateField value={values.dateIso} onChange={set('dateIso')} disabled={disabled} />
      </View>
    </ArtifactCard>
  );
}
