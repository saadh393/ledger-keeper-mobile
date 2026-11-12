import type { Conversation } from '@/features/assistant/schemas/conversation-schema';
import type { VoiceRecording } from '@/features/voice/utils/voice-recorder-reducer';
import type { ApiError } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { randomUUID } from 'expo-crypto';
import { createConversation } from '@/features/assistant/api/create-conversation';
import { fetchConversation } from '@/features/assistant/api/fetch-conversation';
import { AI_TIMEOUT_MS, sendMessage } from '@/features/assistant/api/send-message';
import { openConversationQuery, openConversationQueryKey } from '@/features/assistant/api/use-open-conversation';
import { useAssistantStore } from '@/features/assistant/store/use-assistant-store';
import { releasePending } from '@/features/assistant/utils/release-pending';
import { classifySendError, getReplyFailure, getRetryKey, hasServerReply, isOperationInProgress } from '@/features/assistant/utils/send-retry';
import { useActiveBook } from '@/features/books/hooks/use-active-book';
import { booksKeys } from '@/features/books/utils/query-keys';
import { creditBalanceQueryKey } from '@/features/credits/api/credit-balance-query-key';
import { sendVoice } from '@/features/voice/api/send-voice';
import { deleteRecordingFile } from '@/features/voice/utils/delete-recording-file';
import { toApiError } from '@/lib/api';

const POLL_INTERVAL_MS = 3000;

type Attempt = {
  bookId: string;
  text: string;
  key: string;
  voice?: VoiceRecording;
};

type Anchor = {
  conversationId: string;
  sinceId: string | null;
};

type Recovery = Attempt & {
  anchor?: Anchor;
  error: ApiError;
};

function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  const bookId = useActiveBook().activeBookId;
  const setPending = useAssistantStore(state => state.setPending);
  const setDraft = useAssistantStore(state => state.setDraft);
  const open = useAssistantStore(state => state.open);
  const select = useAssistantStore(state => state.select);

  const refreshBook = (id: string) => queryClient.invalidateQueries({ queryKey: booksKeys.book(id) });

  const reloadHasReply = async ({ bookId: id, anchor: { conversationId, sinceId }, text, key }: Attempt & { anchor: Anchor }) => {
    try {
      const fresh = await queryClient.fetchQuery({ queryKey: openConversationQueryKey(id), queryFn: () => fetchConversation(conversationId), staleTime: 0 });
      return Boolean(fresh && hasServerReply(fresh.messages, sinceId, { text, key }));
    }
    catch {
      return false;
    }
  };

  const settleFromServer = async (recovery: Recovery & { anchor: Anchor }) => {
    if (!isOperationInProgress(recovery.error))
      return reloadHasReply(recovery);
    const deadline = Date.now() + AI_TIMEOUT_MS;
    while (Date.now() < deadline) {
      await wait(POLL_INTERVAL_MS);
      if (await reloadHasReply(recovery))
        return true;
    }
    return false;
  };

  const recover = async (recovery: Recovery) => {
    const { text, key, voice, error, anchor } = recovery;
    const failure = classifySendError(error);
    if (failure.reason === 'uncertain' && anchor && await settleFromServer({ ...recovery, anchor })) {
      deleteRecordingFile(voice?.uri ?? null);
      setPending(null);
      void queryClient.invalidateQueries({ queryKey: creditBalanceQueryKey });
      void refreshBook(recovery.bookId);
      return;
    }
    if (failure.reason === 'too_long' && !voice)
      setDraft(text);
    setPending({ text, key, voice, failure });
  };

  const attempt = async ({ bookId: id, text, key, voice }: Attempt) => {
    setPending({ text, key, voice, failure: null });
    const query = openConversationQuery(id);
    const queryKey = query.queryKey;
    let anchor: Anchor | undefined;
    try {
      const existing = await queryClient.ensureQueryData(query);
      const conversation = existing ?? await createConversation(id);
      if (!existing)
        select({ bookId: id, conversationId: conversation.id });
      queryClient.setQueryData(queryKey, conversation);
      anchor = { conversationId: conversation.id, sinceId: conversation.messages.at(-1)?.id ?? null };
      const result = voice ? await sendVoice(conversation.id, voice, key) : await sendMessage(conversation.id, text, key);
      queryClient.setQueryData<Conversation | null>(queryKey, current => current && { ...current, messages: [...current.messages, result.userMessage, result.aiMessage] });
      queryClient.setQueryData<{ balance: number }>(creditBalanceQueryKey, current => current && { ...current, balance: result.credits.balance });
      void refreshBook(id);
      const failure = getReplyFailure(result);
      if (!failure)
        deleteRecordingFile(voice?.uri ?? null);
      setPending(failure && { text, key, voice, failure });
    }
    catch (error) {
      await recover({ bookId: id, text, key, voice, anchor, error: toApiError(error) });
    }
  };

  const start = (text: string, voice?: VoiceRecording) => {
    const pending = useAssistantStore.getState().pending;
    if (!bookId || pending?.failure === null)
      return false;
    if (pending?.voice)
      releasePending();
    open();
    void attempt({ bookId, text, voice, key: randomUUID() });
    return true;
  };

  const send = (text: string) => {
    start(text);
  };

  const sendRecording = (voice: VoiceRecording) => start('', voice);

  const retry = () => {
    const pending = useAssistantStore.getState().pending;
    if (!bookId || !pending?.failure)
      return;
    void attempt({ bookId, text: pending.text, voice: pending.voice, key: getRetryKey(pending.failure, pending.key, randomUUID) });
  };

  return { send, sendRecording, retry, dismiss: releasePending };
}
