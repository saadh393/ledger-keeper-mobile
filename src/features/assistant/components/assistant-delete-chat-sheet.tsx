import type { BookChat } from '@/features/assistant/schemas/conversation-schema';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheet, BottomSheetView, Button, Text, useBottomSheetModalRef } from '@/components/ui';
import { useDeleteChat } from '@/features/assistant/api/use-delete-chat';

export type AssistantDeleteChatSheetProps = {
  bookId: string;
  chat: BookChat;
  onDismiss: () => void;
};

export function AssistantDeleteChatSheet({ bookId, chat, onDismiss }: AssistantDeleteChatSheetProps) {
  const { t } = useTranslation();
  const modal = useBottomSheetModalRef();
  const insets = useSafeAreaInsets();
  const mutation = useDeleteChat(bookId);
  const submitting = React.useRef(false);

  React.useEffect(() => {
    modal.present();
  }, [modal]);

  const confirm = () => {
    if (submitting.current)
      return;
    submitting.current = true;
    mutation.mutate(chat.id, {
      onSuccess: modal.dismiss,
      onSettled: () => {
        submitting.current = false;
      },
    });
  };

  return (
    <BottomSheet ref={modal.ref} title={t('assistant.deleteChat.title')} dismissible={!mutation.isPending} onDismiss={onDismiss} testID="assistant-delete-chat-sheet">
      <BottomSheetView className="px-4" style={{ paddingBottom: insets.bottom + 16 }}>
        <Text numberOfLines={1} className="text-row-title text-ink-900">{chat.title}</Text>
        <Text testID="assistant-delete-chat-body" className="mt-1 text-body text-ink-700">{t('assistant.deleteChat.body')}</Text>
        {mutation.isError
          ? <Text testID="assistant-delete-chat-error" accessibilityRole="alert" className="mt-3 text-meta text-clay-500">{t('assistant.deleteChat.error')}</Text>
          : null}
        <View className="mt-4 gap-2">
          <Button
            testID="assistant-delete-chat-confirm"
            variant="destructive"
            label={t(mutation.isPending ? 'assistant.deleteChat.deleting' : 'assistant.deleteChat.confirm')}
            pending={mutation.isPending}
            onPress={confirm}
          />
          <Button
            testID="assistant-delete-chat-cancel"
            variant="secondary"
            label={t('assistant.deleteChat.cancel')}
            disabled={mutation.isPending}
            onPress={modal.dismiss}
          />
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}
