import type { DraftAction } from '@/features/assistant/api/run-draft-action';
import type { Conversation } from '@/features/assistant/schemas/conversation-schema';
import type { TransactionDraftArtifactData } from '@/features/assistant/schemas/draft-artifact-schemas';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as React from 'react';
import { runDraftAction } from '@/features/assistant/api/run-draft-action';
import { openConversationQueryKey } from '@/features/assistant/api/use-open-conversation';
import { replaceArtifactData } from '@/features/assistant/utils/replace-artifact-data';
import { resolveDraftConflict } from '@/features/assistant/utils/resolve-draft-conflict';
import { useActiveBook } from '@/features/books/hooks/use-active-book';
import { booksKeys } from '@/features/books/utils/query-keys';
import { toApiError } from '@/lib/api';

export function useDraftAction(artifactId: string, data: TransactionDraftArtifactData) {
  const queryClient = useQueryClient();
  const bookId = useActiveBook().activeBookId ?? '';
  const queryKey = openConversationQueryKey(bookId);
  const busy = React.useRef(false);

  const mutation = useMutation({
    mutationFn: async (action: DraftAction) => {
      const conversationId = queryClient.getQueryData<Conversation | null>(queryKey)?.id;
      if (!conversationId)
        throw new Error('Conversation not loaded');
      try {
        return await runDraftAction(conversationId, artifactId, action);
      }
      catch (error) {
        const resolved = resolveDraftConflict(toApiError(error), data);
        if (resolved)
          return resolved;
        throw error;
      }
    },
    onSuccess: (next) => {
      queryClient.setQueryData<Conversation | null>(queryKey, current => current && replaceArtifactData(current, artifactId, next));
      if (next.status === 'saved')
        void queryClient.invalidateQueries({ queryKey: booksKeys.book(bookId) });
    },
    onSettled: () => {
      busy.current = false;
    },
  });

  const run = (action: DraftAction) => {
    if (busy.current)
      return;
    busy.current = true;
    mutation.mutate(action);
  };

  const retry = () => {
    if (mutation.variables)
      run(mutation.variables);
  };

  return {
    run,
    retry,
    pending: mutation.isPending ? mutation.variables?.type ?? null : null,
    failed: mutation.isError ? mutation.variables?.type ?? null : null,
  };
}
