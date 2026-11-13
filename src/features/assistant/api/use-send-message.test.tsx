import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';
import { randomUUID } from 'expo-crypto';
import * as React from 'react';
import { openConversationQueryKey } from '@/features/assistant/api/use-open-conversation';
import { useSendMessage } from '@/features/assistant/api/use-send-message';
import { useAssistantStore } from '@/features/assistant/store/use-assistant-store';
import { useActiveBookStore } from '@/features/books/store/use-active-book-store';
import { apiClient } from '@/lib/api/client';
import { act, renderHook, waitFor } from '@/lib/test-utils';

jest.mock('expo-crypto', () => ({ randomUUID: jest.fn() }));

const book = { id: 'b1', name: 'Personal', currency: 'BDT', isDefault: true, createdAt: '2026-01-01T00:00:00.000Z' };
const conversation = { id: 'c1', bookId: 'b1', title: 'Chat', currency: 'BDT', messages: [], hasMore: false };
const reply = {
  userMessage: { id: 'u1', role: 'user', text: 'Spent 250 on lunch', createdAt: '2026-11-11T06:00:00.000Z' },
  aiMessage: { id: 'a1', role: 'ai', text: 'Saved', createdAt: '2026-11-11T06:00:01.000Z' },
  credits: { charged: 1, balance: 9 },
};

describe('useSendMessage', () => {
  let mock: MockAdapter;
  let queryClient: QueryClient;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    let count = 0;
    jest.mocked(randomUUID).mockImplementation(() => `key-${++count}` as ReturnType<typeof randomUUID>);
    queryClient.setQueryData(['books'], [book]);
    act(() => {
      useActiveBookStore.setState({ activeBookId: 'b1' });
      useAssistantStore.setState({ pending: null, selection: null, isOpen: false, draft: '' });
    });
  });

  afterEach(() => {
    mock.restore();
    queryClient.clear();
  });

  function setup() {
    const wrapper = ({ children }: { children: React.ReactNode }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    return renderHook(() => useSendMessage(), { wrapper });
  }

  function keys() {
    return mock.history.post.filter(request => request.url?.endsWith('/messages')).map(request => request.headers?.['Idempotency-Key']);
  }

  it('creates the chat on the first send and appends the reply', async () => {
    mock.onGet('/books/b1/conversations').reply(200, { items: [], nextCursor: null });
    mock.onPost('/conversations').reply(201, { id: 'c1', bookId: 'b1', suffix: 'New chat', currency: 'BDT' });
    mock.onPost('/conversations/c1/messages').reply(201, reply);
    const { result } = setup();
    act(() => result.current.send('Spent 250 on lunch'));
    await waitFor(() => expect(useAssistantStore.getState().pending).toBeNull());
    expect(JSON.parse(mock.history.post[0].data)).toEqual({ bookId: 'b1' });
    expect(keys()).toEqual(['key-1']);
    expect(useAssistantStore.getState().selection).toEqual({ bookId: 'b1', conversationId: 'c1' });
    expect(queryClient.getQueryData<{ messages: unknown[] }>(openConversationQueryKey('b1'))?.messages).toHaveLength(2);
  });

  it('reuses the key when retrying an uncertain failure', async () => {
    queryClient.setQueryData(openConversationQueryKey('b1'), conversation);
    mock.onPost('/conversations/c1/messages').replyOnce(503).onPost('/conversations/c1/messages').reply(201, reply);
    mock.onGet('/conversations/c1').reply(200, conversation);
    const { result } = setup();
    act(() => result.current.send('Spent 250 on lunch'));
    await waitFor(() => expect(useAssistantStore.getState().pending?.failure?.reason).toBe('uncertain'));
    act(() => result.current.retry());
    await waitFor(() => expect(useAssistantStore.getState().pending).toBeNull());
    expect(keys()).toEqual(['key-1', 'key-1']);
  });

  it('uses a new key after operation_failed', async () => {
    queryClient.setQueryData(openConversationQueryKey('b1'), conversation);
    mock.onPost('/conversations/c1/messages').replyOnce(409, { code: 'operation_failed' }).onPost('/conversations/c1/messages').reply(201, reply);
    const { result } = setup();
    act(() => result.current.send('Spent 250 on lunch'));
    await waitFor(() => expect(useAssistantStore.getState().pending?.failure?.reason).toBe('failed'));
    act(() => result.current.retry());
    await waitFor(() => expect(useAssistantStore.getState().pending).toBeNull());
    expect(keys()).toEqual(['key-1', 'key-2']);
  });

  it('uses a new key after a provider error reply', async () => {
    queryClient.setQueryData(openConversationQueryKey('b1'), conversation);
    const failed = { ...reply, aiMessage: { ...reply.aiMessage, artifacts: [{ id: 's', type: 'status', data: { tone: 'error', title: 'x', body: 'y' } }] }, credits: { charged: 0, balance: 10 } };
    mock.onPost('/conversations/c1/messages').replyOnce(201, failed).onPost('/conversations/c1/messages').reply(201, reply);
    const { result } = setup();
    act(() => result.current.send('Spent 250 on lunch'));
    await waitFor(() => expect(useAssistantStore.getState().pending?.failure?.reason).toBe('provider'));
    act(() => result.current.retry());
    await waitFor(() => expect(useAssistantStore.getState().pending).toBeNull());
    expect(keys()).toEqual(['key-1', 'key-2']);
  });

  it('shows the credits card on 402', async () => {
    queryClient.setQueryData(openConversationQueryKey('b1'), conversation);
    mock.onPost('/conversations/c1/messages').reply(402, { code: 'insufficient_credits', required: 3, available: 1 });
    const { result } = setup();
    act(() => result.current.send('Spent 250 on lunch'));
    await waitFor(() => expect(useAssistantStore.getState().pending?.failure).toEqual({ reason: 'credits', retryKey: null, required: 3, available: 1 }));
  });
});
