import BottomSheet from '@gorhom/bottom-sheet';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { BackHandler } from 'react-native';
import { useLatestConversation } from '@/features/assistant/api/use-latest-conversation';
import { AssistantSheetBody } from '@/features/assistant/components/assistant-sheet-body';
import { AssistantSheetHeader } from '@/features/assistant/components/assistant-sheet-header';
import { useAssistantStore } from '@/features/assistant/store/use-assistant-store';
import { useActiveBook } from '@/features/books/hooks/use-active-book';
import { useThemeColors } from '@/lib/theme/use-theme-colors';

const snapPoints = ['60%', '100%'];

export function AssistantSheet() {
  const { t } = useTranslation();
  const themeColors = useThemeColors();
  const close = useAssistantStore(state => state.close);
  const activeBook = useActiveBook();
  const conversation = useLatestConversation(activeBook.activeBookId);
  const sheetRef = React.useRef<BottomSheet>(null);
  const dismiss = React.useCallback(() => sheetRef.current?.close(), []);

  React.useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
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
      onClose={close}
      style={{ elevation: 12, borderTopLeftRadius: 28, borderTopRightRadius: 28 }}
      backgroundStyle={{ backgroundColor: themeColors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28 }}
      handleIndicatorStyle={{ backgroundColor: themeColors['border-strong'], width: 48 }}
    >
      <AssistantSheetHeader title={conversation.data?.title ?? t('assistant.sheet.title')} onClose={dismiss} />
      <AssistantSheetBody conversation={conversation} />
    </BottomSheet>
  );
}
