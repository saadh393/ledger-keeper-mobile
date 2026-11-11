import type { KeyboardTypeOptions } from 'react-native';
import { ArrowUp } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui';
import { AiBarIconButton } from '@/features/assistant/components/ai-bar-icon-button';

export type ClarificationInputProps = {
  placeholder: string;
  keyboardType?: KeyboardTypeOptions;
  onSubmit: (value: string) => void;
  disabled: boolean;
};

export function ClarificationInput({ placeholder, keyboardType, onSubmit, disabled }: ClarificationInputProps) {
  const { t } = useTranslation();
  const [value, setValue] = React.useState('');
  const trimmed = value.trim();

  const submit = () => {
    if (!trimmed || disabled)
      return;
    onSubmit(trimmed);
    setValue('');
  };

  return (
    <Input
      testID="clarification-input"
      value={value}
      onChangeText={setValue}
      placeholder={placeholder}
      keyboardType={keyboardType}
      returnKeyType="send"
      onSubmitEditing={submit}
      disabled={disabled}
      containerClassName="mb-0"
      className="bg-paper-100"
      rightAccessory={<AiBarIconButton testID="clarification-send" icon={ArrowUp} label={t('assistant.clarification.send')} onPress={submit} disabled={!trimmed || disabled} accent />}
    />
  );
}
