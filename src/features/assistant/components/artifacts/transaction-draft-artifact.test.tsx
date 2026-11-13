import type { TransactionDraftArtifactData } from '@/features/assistant/schemas/draft-artifact-schemas';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';
import * as React from 'react';
import { openConversationQueryKey } from '@/features/assistant/api/use-open-conversation';
import { ArtifactRenderer } from '@/features/assistant/components/artifacts/artifact-renderer';
import { useActiveBookStore } from '@/features/books/store/use-active-book-store';
import { apiClient } from '@/lib/api/client';
import { act, fireEvent, render, screen } from '@/lib/test-utils';

const draft: TransactionDraftArtifactData = {
  draftId: 'd1',
  kind: 'expense',
  title: 'Lunch',
  category: 'Food',
  amount: 250,
  dateIso: '2026-11-11T06:00:00.000Z',
  note: null,
  original: null,
  categories: ['Food', 'Transport'],
  status: 'draft',
  deleted: false,
};
const book = { id: 'b1', name: 'Personal', currency: 'BDT', isDefault: true, createdAt: '2026-01-01T00:00:00.000Z' };
const base = '/conversations/c1/artifacts/art1';

describe('transactionDraftArtifact', () => {
  let mock: MockAdapter;
  let queryClient: QueryClient;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    queryClient.setQueryData(['books'], [book]);
    act(() => useActiveBookStore.setState({ activeBookId: 'b1' }));
  });

  afterEach(() => {
    mock.restore();
    queryClient.clear();
  });

  function renderDraft(data: TransactionDraftArtifactData = draft) {
    const conversation = { id: 'c1', bookId: 'b1', title: 'Chat', currency: 'BDT', hasMore: false, messages: [{ id: 'm1', role: 'ai', createdAt: draft.dateIso, artifacts: [{ id: 'art1', type: 'transaction-draft', data }] }] };
    queryClient.setQueryData(openConversationQueryKey('b1'), conversation);
    function Live() {
      const [current, setCurrent] = React.useState<unknown>(data);
      React.useEffect(() => queryClient.getQueryCache().subscribe(() => {
        const cached = queryClient.getQueryData<typeof conversation>(openConversationQueryKey('b1'));
        setCurrent(cached?.messages[0]?.artifacts[0]?.data ?? data);
      }), []);
      return <ArtifactRenderer artifact={{ id: 'art1', type: 'transaction-draft', data: current }} currency="BDT" />;
    }
    render(<QueryClientProvider client={queryClient}><Live /></QueryClientProvider>);
  }

  it('enables Save only when kind, title, category and amount are set', () => {
    renderDraft({ ...draft, amount: null });
    expect(screen.getByTestId('draft-save')).toBeDisabled();
    expect(screen.getByText('Add the amount to save this')).toBeOnTheScreen();
    fireEvent.changeText(screen.getByTestId('draft-amount'), '300');
    expect(screen.getByTestId('draft-save')).toBeEnabled();
    fireEvent.changeText(screen.getByTestId('draft-title'), ' ');
    expect(screen.getByTestId('draft-save')).toBeDisabled();
  });

  it('confirms with the edited values and shows the saved card', async () => {
    mock.onPost(`${base}/confirm`).reply(200, { ...draft, amount: 300, status: 'saved', savedId: 't1' });
    renderDraft();
    fireEvent.changeText(screen.getByTestId('draft-amount'), '300');
    fireEvent.press(screen.getByTestId('draft-save'));
    expect(await screen.findByTestId('draft-saved')).toBeOnTheScreen();
    expect(JSON.parse(mock.history.post[0].data)).toEqual({ kind: 'expense', title: 'Lunch', category: 'Food', amount: 300, dateIso: draft.dateIso });
  });

  it('discards and restores the draft', async () => {
    mock.onPost(`${base}/dismiss`).reply(200, { ...draft, status: 'dismissed' });
    mock.onPost(`${base}/restore`).reply(200, draft);
    renderDraft();
    fireEvent.press(screen.getByTestId('draft-discard'));
    fireEvent.press(await screen.findByTestId('draft-undo'));
    expect(await screen.findByTestId('draft-editor')).toBeOnTheScreen();
    expect(mock.history.post.map(request => request.url)).toEqual([`${base}/dismiss`, `${base}/restore`]);
  });

  it.each([
    ['draft_saved', 'draft-saved'],
    ['draft_dismissed', 'draft-discarded'],
  ])('resolves a 409 %s to the server state', async (code, testID) => {
    mock.onPost(`${base}/confirm`).reply(409, { code });
    renderDraft();
    fireEvent.press(screen.getByTestId('draft-save'));
    expect(await screen.findByTestId(testID)).toBeOnTheScreen();
  });

  it('keeps the edits and offers Retry when saving fails', async () => {
    mock.onPost(`${base}/confirm`).replyOnce(500).onPost(`${base}/confirm`).reply(200, { ...draft, amount: 300, status: 'saved' });
    renderDraft();
    fireEvent.changeText(screen.getByTestId('draft-amount'), '300');
    fireEvent.press(screen.getByTestId('draft-save'));
    expect(await screen.findByTestId('draft-error')).toBeOnTheScreen();
    expect(screen.getByTestId('draft-amount')).toHaveDisplayValue('300');
    fireEvent.press(screen.getByTestId('draft-retry'));
    expect(await screen.findByTestId('draft-saved')).toBeOnTheScreen();
  });
});
