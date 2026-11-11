import type { Conversation } from '@/features/assistant/schemas/conversation-schema';
import type { ApiError } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { randomUUID } from 'expo-crypto';
import { createConversation } from '@/features/assistant/api/create-conversation';
import { fetchLatestConversation } from '@/features/assistant/api/fetch-latest-conversation';
import { AI_TIMEOUT_MS, sendMessage } from '@/features/assistant/api/send-message';
import { latestConversationQueryKey } from '@/features/assistant/api/use-latest-conversation';
import { useAssistantStore } from '@/features/assistant/store/use-assistant-store';
import { classifySendError, getRetryKey, hasServerReply, isOperationInProgress, isProviderFailure } from '@/features/assistant/utils/send-retry';
import { useActiveBook } from '@/features/books/hooks/use-active-book';
import { booksKeys } from '@/features/books/utils/query-keys';
import { creditBalanceQueryKey } from '@/features/credits/api/credit-balance-query-key';
import { toApiError } from '@/lib/api';

const POLL_INTERVAL_MS = 3000;

type Attempt = {
  bookId: string;
  text: string;
  key: string;
};

type Recovery = Attempt & {
  sinceId?: string | null;
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

  const refreshBook = (id: string) => queryClient.invalidateQueries({ queryKey: booksKeys.book(id) });

  const reloadHasReply = async ({ bookId: id, sinceId, text }: { bookId: string; sinceId: string | null; text: string }) => {
    try {
      const fresh = await queryClient.fetchQuery({ queryKey: latestConversationQueryKey(id), queryFn: () => fetchLatestConversation(id), staleTime: 0 });
      return Boolean(fresh && hasServerReply(fresh.messages, sinceId, text));
    }
    catch {
      return false;
    }
  };

  const settleFromServer = async (recovery: Recovery & { sinceId: string | null }) => {
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
    const { text, key, error, sinceId } = recovery;
    const failure = classifySendError(error);
    if (failure.reason === 'uncertain' && sinceId !== undefined && await settleFromServer({ ...recovery, sinceId })) {
      setPending(null);
      void queryClient.invalidateQueries({ queryKey: creditBalanceQueryKey });
      void refreshBook(recovery.bookId);
      return;
    }
    if (failure.reason === 'too_long')
      setDraft(text);
    setPending({ text, key, failure });
  };

  const attempt = async ({ bookId: id, text, key }: Attempt) => {
    setPending({ text, key, failure: null });
    const queryKey = latestConversationQueryKey(id);
    let sinceId: string | null | undefined;
    try {
      const conversation = await queryClient.ensureQueryData({ queryKey, queryFn: () => fetchLatestConversation(id) }) ?? await createConversation(id);
      queryClient.setQueryData(queryKey, conversation);
      sinceId = conversation.messages.at(-1)?.id ?? null;
      const result = await sendMessage(conversation.id, text, key);
      queryClient.setQueryData<Conversation | null>(queryKey, current => current && { ...current, messages: [...current.messages, result.userMessage, result.aiMessage] });
      queryClient.setQueryData<{ balance: number }>(creditBalanceQueryKey, current => current && { ...current, balance: result.credits.balance });
      void refreshBook(id);
      setPending(isProviderFailure(result.aiMessage, result.credits.charged) ? { text, key, failure: { reason: 'provider', retryKey: 'new' } } : null);
    }
    catch (error) {
      await recover({ bookId: id, text, key, sinceId, error: toApiError(error) });
    }
  };

  const send = (text: string) => {
    if (!bookId || useAssistantStore.getState().pending?.failure === null)
      return;
    open();
    void attempt({ bookId, text, key: randomUUID() });
  };

  const retry = () => {
    const pending = useAssistantStore.getState().pending;
    if (!bookId || !pending?.failure)
      return;
    void attempt({ bookId, text: pending.text, key: getRetryKey(pending.failure, pending.key, randomUUID) });
  };

  const dismiss = () => {
    const pending = useAssistantStore.getState().pending;
    if (pending)
      setDraft(pending.text);
    setPending(null);
  };

  return { send, retry, dismiss };
}
