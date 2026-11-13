import * as React from 'react';
import { View } from 'react-native';
import { DetectedList } from '@/features/auto-capture/components/detected-list';
import { useBackTo } from '@/features/auto-capture/hooks/use-back-to';
import { useActiveBook } from '@/features/books/hooks/use-active-book';

export function DetectedScreen() {
  const activeBook = useActiveBook();
  useBackTo('/');
  return (
    <View testID="detected-screen" className="flex-1 bg-paper-100">
      {activeBook.activeBookId
        ? <DetectedList key={activeBook.activeBookId} bookId={activeBook.activeBookId} currency={activeBook.activeBook?.currency ?? 'BDT'} />
        : null}
    </View>
  );
}
