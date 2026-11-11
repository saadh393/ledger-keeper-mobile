import { Check } from 'lucide-react-native';
import * as React from 'react';
import { View } from 'react-native';
import { Text, ToneTile } from '@/components/ui';

export type ClarificationAnsweredProps = {
  question: string;
  answer: string;
};

export function ClarificationAnswered({ question, answer }: ClarificationAnsweredProps) {
  return (
    <View
      testID="clarification-answered"
      accessible
      accessibilityLabel={`${question} ${answer}`}
      className="flex-row items-center gap-3 rounded-3xl border border-forest-100 bg-surface-container px-4 py-3"
    >
      <ToneTile tone="income" icon={Check} size="sm" iconSize={16} />
      <Text numberOfLines={2} className="min-w-0 flex-1 text-body text-ink-500">
        {`${question} `}
        <Text className="text-body font-medium text-ink-900">{answer}</Text>
      </Text>
    </View>
  );
}
