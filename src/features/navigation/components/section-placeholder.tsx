import * as React from 'react';
import { Text, View } from '@/components/ui';

export type SectionPlaceholderProps = {
  title: string;
};

export function SectionPlaceholder({ title }: SectionPlaceholderProps) {
  return (
    <View
      testID="section-placeholder"
      className="flex-1 items-center justify-center bg-paper-100 px-4"
    >
      <Text
        className="text-center text-title font-medium text-ink-900"
        testID="section-placeholder-title"
      >
        {title}
      </Text>
    </View>
  );
}
