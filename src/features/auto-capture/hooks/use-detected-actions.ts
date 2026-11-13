import type { DetectedItem } from '@/features/auto-capture/schemas/detected-item-schema';
import { useQueryClient } from '@tanstack/react-query';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { showMessage } from 'react-native-flash-message';
import { showErrorMessage } from '@/components/ui';
import { confirmDetected } from '@/features/auto-capture/api/confirm-detected';
import { discardDetected } from '@/features/auto-capture/api/discard-detected';
import { restoreDetected } from '@/features/auto-capture/api/restore-detected';
import { detectedKeys } from '@/features/auto-capture/utils/detected-keys';
import { booksKeys } from '@/features/books/utils/query-keys';
import { ApiError } from '@/lib/api/errors';

function isHandledElsewhere(error: unknown) {
  return error instanceof ApiError && (error.status === 404 || error.status === 409);
}

export function useDetectedActions(bookId: string) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const pending = React.useRef(new Set<string>());
  const [pendingIds, setPendingIds] = React.useState<ReadonlySet<string>>(new Set());

  const refresh = React.useCallback(() => Promise.all([
    queryClient.invalidateQueries({ queryKey: detectedKeys.all(bookId) }),
    queryClient.invalidateQueries({ queryKey: booksKeys.table(bookId) }),
  ]), [queryClient, bookId]);

  const run = async (item: DetectedItem, action: () => Promise<unknown>, errorKey: 'confirmError' | 'discardError') => {
    if (pending.current.has(item.id))
      return false;
    pending.current.add(item.id);
    setPendingIds(new Set(pending.current));
    try {
      await action();
      return true;
    }
    catch (error) {
      if (!isHandledElsewhere(error))
        showErrorMessage(t(`autoCapture.inbox.${errorKey}`));
      return isHandledElsewhere(error);
    }
    finally {
      pending.current.delete(item.id);
      setPendingIds(new Set(pending.current));
      await refresh();
    }
  };

  const confirm = (item: DetectedItem) => run(item, () => confirmDetected(bookId, item.id), 'confirmError');

  const discard = async (item: DetectedItem) => {
    const discarded = await run(item, () => discardDetected(bookId, item.id), 'discardError');
    if (!discarded)
      return;
    showMessage({
      type: 'info',
      duration: 5000,
      message: t('autoCapture.inbox.discarded'),
      description: t('autoCapture.inbox.undo'),
      onPress: () => {
        restoreDetected(bookId, item.id).then(refresh).catch(() => showErrorMessage(t('autoCapture.inbox.undoError')));
      },
    });
  };

  return { confirm, discard, refresh, pendingIds };
}
