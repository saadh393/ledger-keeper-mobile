import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';
import * as React from 'react';
import { openConversationQueryKey } from '@/features/assistant/api/use-open-conversation';
import { AssistantSheet } from '@/features/assistant/components/assistant-sheet';
import { useAssistantStore } from '@/features/assistant/store/use-assistant-store';
import { useActiveBookStore } from '@/features/books/store/use-active-book-store';
import { apiClient } from '@/lib/api/client';
import { act, fireEvent, render, screen, waitFor } from '@/lib/test-utils';

jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn() }) }));

const book = { id: 'b1', name: 'Personal', currency: 'BDT', isDefault: true, createdAt: '2026-01-01T00:00:00.000Z' };
const chat = (id: string) => ({ id, title: `Chat ${id}`, createdAt: '2026-11-10T06:00:00.000Z', updatedAt: '2026-11-11T06:00:00.000Z' });
const message = (id: string) => ({ id, role: 'user', text: `text ${id}`, createdAt: '2026-11-11T06:00:00.000Z' });
const conversation = (id: string, messages: unknown[], hasMore = false) => ({ id, bookId: 'b1', title: `Chat ${id}`, currency: 'BDT', messages, hasMore });

describe('assistant chat history', () => {
  let mock: MockAdapter;
  let queryClient: QueryClient;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    queryClient.setQueryData(['books'], [book]);
    act(() => {
      useActiveBookStore.setState({ activeBookId: 'b1' });
      useAssistantStore.setState({ pending: null, selection: { bookId: 'b1', conversationId: 'c1' }, view: 'history', isOpen: true });
    });
    mock.onGet('/conversations/c1').reply(200, conversation('c1', [message('m1')]));
  });

  afterEach(() => {
    mock.restore();
    queryClient.clear();
  });

  function renderSheet() {
    render(<QueryClientProvider client={queryClient}><AssistantSheet /></QueryClientProvider>);
  }

  it('loads older chats page by page', async () => {
    mock.onGet('/books/b1/conversations', { params: { cursor: undefined, limit: 20 } }).reply(200, { items: [chat('c1'), chat('c2')], nextCursor: 'next' });
    mock.onGet('/books/b1/conversations', { params: { cursor: 'next', limit: 20 } }).reply(200, { items: [chat('c3')], nextCursor: null });
    renderSheet();
    fireEvent.press(await screen.findByTestId('assistant-history-show-older'));
    expect(await screen.findByTestId('assistant-history-row-c3')).toBeOnTheScreen();
    await waitFor(() => expect(screen.queryByTestId('assistant-history-show-older')).toBeNull());
  });

  it('opens another chat in the thread', async () => {
    mock.onGet('/books/b1/conversations').reply(200, { items: [chat('c1'), chat('c2')], nextCursor: null });
    mock.onGet('/conversations/c2').reply(200, conversation('c2', [message('m9')]));
    renderSheet();
    fireEvent.press(await screen.findByTestId('assistant-history-open-c2'));
    expect(useAssistantStore.getState()).toMatchObject({ view: 'thread', selection: { bookId: 'b1', conversationId: 'c2' } });
    expect(await screen.findByText('text m9')).toBeOnTheScreen();
  });

  it('deletes the open chat and switches to a new empty chat', async () => {
    mock.onGet('/books/b1/conversations').reply(200, { items: [chat('c1'), chat('c2')], nextCursor: null });
    mock.onDelete('/conversations/c1').reply(204);
    await act(() => queryClient.fetchQuery({ queryKey: openConversationQueryKey('b1'), queryFn: () => conversation('c1', [message('m1')]) }));
    renderSheet();
    fireEvent.press(await screen.findByTestId('assistant-history-delete-c1'));
    fireEvent.press(await screen.findByTestId('assistant-delete-chat-confirm'));
    await waitFor(() => expect(mock.history.delete).toHaveLength(1));
    await waitFor(() => expect(screen.queryByTestId('assistant-history-row-c1')).toBeNull());
    expect(screen.getByTestId('assistant-history-row-c2')).toBeOnTheScreen();
    expect(useAssistantStore.getState().selection).toEqual({ bookId: 'b1', conversationId: null });
  });

  it('loads earlier messages above the thread', async () => {
    act(() => useAssistantStore.setState({ view: 'thread' }));
    mock.onGet('/conversations/c1').reply(200, conversation('c1', [message('m5')], true));
    mock.onGet('/conversations/c1/messages').reply(200, { messages: [message('m4')], hasMore: false });
    renderSheet();
    fireEvent.press(await screen.findByTestId('assistant-load-earlier-button'));
    expect(await screen.findByText('text m4')).toBeOnTheScreen();
    expect(mock.history.get.find(request => request.url === '/conversations/c1/messages')?.params).toEqual({ before: 'm5', limit: 50 });
    expect(screen.queryByTestId('assistant-load-earlier')).toBeNull();
  });
});
