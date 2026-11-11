import type { BottomSheetHandleProps } from '@gorhom/bottom-sheet';
import type { StyleProp, ViewStyle } from 'react-native';
import { BottomSheetHandle, useBottomSheet } from '@gorhom/bottom-sheet';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useOpenConversation } from '@/features/assistant/api/use-open-conversation';
import { AssistantSheetHeader } from '@/features/assistant/components/assistant-sheet-header';
import { useActiveBook } from '@/features/books/hooks/use-active-book';

const handleStyle = { paddingHorizontal: 0, paddingBottom: 0, gap: 10 };

export function AssistantSheetHandle(props: BottomSheetHandleProps & { indicatorStyle?: StyleProp<ViewStyle> }) {
  const { t } = useTranslation();
  const { close } = useBottomSheet();
  const activeBook = useActiveBook();
  const conversation = useOpenConversation(activeBook.activeBookId);

  return (
    <BottomSheetHandle {...props} style={handleStyle} accessible={false}>
      <AssistantSheetHeader title={conversation.data?.title ?? t('assistant.sheet.title')} onClose={() => close()} />
    </BottomSheetHandle>
  );
}
