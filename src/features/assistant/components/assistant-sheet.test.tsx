import BottomSheet from '@gorhom/bottom-sheet';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';
import * as React from 'react';
import { AssistantSheet } from '@/features/assistant/components/assistant-sheet';
import { AssistantSheetHeader } from '@/features/assistant/components/assistant-sheet-header';
import { useAssistantStore } from '@/features/assistant/store/use-assistant-store';
import { useActiveBookStore } from '@/features/books/store/use-active-book-store';
import { apiClient } from '@/lib/api/client';
import { act, fireEvent, render, screen } from '@/lib/test-utils';

jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn() }) }));

const book = { id: 'b1', name: 'Personal', currency: 'BDT', isDefault: true, createdAt: '2026-01-01T00:00:00.000Z' };
const chat = (id: string) => ({ id, title: `Chat ${id}`, createdAt: '2026-11-10T06:00:00.000Z', updatedAt: '2026-11-11T06:00:00.000Z' });
const message = (id: string, role: 'user' | 'ai', createdAt: string) => ({ id, role, text: `text ${id}`, createdAt });
const conversation = (id: string, messages: unknown[]) => ({ id, bookId: 'b1', title: `Chat ${id}`, currency: 'BDT', messages, hasMore: false });

describe('assistantSheet', () => {
  let mock: MockAdapter;
  let queryClient: QueryClient;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    queryClient.setQueryData(['books'], [book]);
    act(() => {
      useActiveBookStore.setState({ activeBookId: 'b1' });
      useAssistantStore.setState({ pending: null, selection: null, view: 'thread', isOpen: true });
    });
  });

  afterEach(() => {
    mock.restore();
    queryClient.clear();
  });

  function renderSheet() {
    render(<QueryClientProvider client={queryClient}><AssistantSheet /></QueryClientProvider>);
  }

  it('opens the most recently active chat with messages in order and day dividers', async () => {
    mock.onGet('/books/b1/conversations').reply(200, { items: [chat('c2')], nextCursor: null });
    mock.onGet('/conversations/c2').reply(200, conversation('c2', [
      message('m1', 'user', '2026-11-10T06:00:00.000Z'),
      message('m2', 'ai', '2026-11-10T06:00:05.000Z'),
      message('m3', 'user', '2026-11-11T06:00:00.000Z'),
    ]));
    renderSheet();
    expect(await screen.findByText('text m3')).toBeOnTheScreen();
    expect(mock.history.get.find(request => request.url === '/books/b1/conversations')?.params).toMatchObject({ limit: 1 });
    expect(screen.getAllByTestId('assistant-day-divider')).toHaveLength(2);
    const texts = screen.getAllByText(/^text m\d$/).map(node => node.props.children);
    expect(texts).toEqual(['text m3', 'text m2', 'text m1']);
    expect(screen.getAllByTestId('assistant-message-user', { exact: false })).toHaveLength(2);
  });

  it('opens the selected chat instead of the latest', async () => {
    act(() => useAssistantStore.setState({ selection: { bookId: 'b1', conversationId: 'c9' } }));
    mock.onGet('/conversations/c9').reply(200, conversation('c9', [message('m1', 'user', '2026-11-11T06:00:00.000Z')]));
    renderSheet();
    expect(await screen.findByText('text m1')).toBeOnTheScreen();
    expect(mock.history.get.some(request => request.url === '/books/b1/conversations')).toBe(false);
  });

  it('shows the empty state for a book without chats', async () => {
    mock.onGet('/books/b1/conversations').reply(200, { items: [], nextCursor: null });
    renderSheet();
    expect(await screen.findByTestId('assistant-empty')).toBeOnTheScreen();
  });

  it('shows an unknown artifact as unavailable', async () => {
    mock.onGet('/books/b1/conversations').reply(200, { items: [chat('c1')], nextCursor: null });
    mock.onGet('/conversations/c1').reply(200, conversation('c1', [{ ...message('m1', 'ai', '2026-11-11T06:00:00.000Z'), artifacts: [{ id: 'x', type: 'hologram', data: {} }] }]));
    renderSheet();
    expect(await screen.findByTestId('artifact-unavailable')).toBeOnTheScreen();
  });

  it('shows placeholders while loading', () => {
    mock.onGet('/books/b1/conversations').reply(() => new Promise(() => {}));
    renderSheet();
    expect(screen.getByTestId('assistant-thread-loading')).toBeOnTheScreen();
  });

  it('shows the error state and retries', async () => {
    mock.onGet('/books/b1/conversations').replyOnce(500).onGet('/books/b1/conversations').reply(200, { items: [], nextCursor: null });
    renderSheet();
    fireEvent.press(await screen.findByText('Retry'));
    expect(await screen.findByTestId('assistant-empty')).toBeOnTheScreen();
  });

  it('resizes with the keyboard instead of panning above it', () => {
    mock.onGet('/books/b1/conversations').reply(() => new Promise(() => {}));
    renderSheet();
    expect(screen.UNSAFE_getByType(BottomSheet).props.android_keyboardInputMode).toBe('adjustResize');
  });

  it('starts a new chat from the header', () => {
    queryClient.setQueryData(['books', 'b1', 'conversations', 'open'], conversation('c1', []));
    render(<QueryClientProvider client={queryClient}><AssistantSheetHeader title="Chat c1" onClose={jest.fn()} /></QueryClientProvider>);
    fireEvent.press(screen.getByTestId('assistant-new-chat'));
    expect(useAssistantStore.getState().selection).toEqual({ bookId: 'b1', conversationId: null });
  });

  it('shows the chat history view', async () => {
    act(() => useAssistantStore.setState({ view: 'history' }));
    mock.onGet('/books/b1/conversations').reply(200, { items: [chat('c1')], nextCursor: null });
    renderSheet();
    expect(await screen.findByTestId('assistant-history')).toBeOnTheScreen();
  });
});
