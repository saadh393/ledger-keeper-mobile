import BottomSheet from '@gorhom/bottom-sheet';
import { useQueryClient } from '@tanstack/react-query';
import * as React from 'react';
import { BackHandler } from 'react-native';
import { openConversationQueryKey, useOpenConversation } from '@/features/assistant/api/use-open-conversation';
import { AssistantHistory } from '@/features/assistant/components/assistant-history';
import { AssistantSheetBody } from '@/features/assistant/components/assistant-sheet-body';
import { AssistantSheetHandle } from '@/features/assistant/components/assistant-sheet-handle';
import { AssistantSheetViewport } from '@/features/assistant/components/assistant-sheet-viewport';
import { useAssistantStore } from '@/features/assistant/store/use-assistant-store';
import { useActiveBook } from '@/features/books/hooks/use-active-book';
import { useThemeColors } from '@/lib/theme/use-theme-colors';

const snapPoints = ['60%', '100%'];

export function AssistantSheet() {
  const themeColors = useThemeColors();
  const queryClient = useQueryClient();
  const close = useAssistantStore(state => state.close);
  const isHistory = useAssistantStore(state => state.view === 'history');
  const activeBook = useActiveBook();
  const conversation = useOpenConversation(activeBook.activeBookId);
  const sheetRef = React.useRef<BottomSheet>(null);
  const dismiss = React.useCallback(() => sheetRef.current?.close(), []);

  const handleClose = React.useCallback(() => {
    const { selection } = useAssistantStore.getState();
    if (selection)
      queryClient.removeQueries({ queryKey: openConversationQueryKey(selection.bookId) });
    close();
  }, [close, queryClient]);

  React.useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      const { view, setView } = useAssistantStore.getState();
      if (view === 'history')
        setView('thread');
      else
        dismiss();
      return true;
    });
    return () => subscription.remove();
  }, [dismiss]);

  return (
    <BottomSheet
      ref={sheetRef}
      index={0}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose
      enableContentPanningGesture={false}
      handleComponent={AssistantSheetHandle}
      onClose={handleClose}
      style={{ elevation: 12, borderTopLeftRadius: 28, borderTopRightRadius: 28 }}
      backgroundStyle={{ backgroundColor: themeColors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28 }}
      handleIndicatorStyle={{ backgroundColor: themeColors['border-strong'], width: 48 }}
    >
      <AssistantSheetViewport>
        {isHistory
          ? <AssistantHistory bookId={activeBook.activeBookId} openConversationId={conversation.data?.id ?? null} />
          : <AssistantSheetBody conversation={conversation} />}
      </AssistantSheetViewport>
    </BottomSheet>
  );
}
