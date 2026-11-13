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

const mockDelete = jest.fn();

jest.mock('expo-crypto', () => ({ randomUUID: jest.fn() }));
jest.mock('expo-file-system', () => ({
  File: jest.fn().mockImplementation((uri: string) => ({
    uri,
    exists: true,
    bytes: async () => new Uint8Array([1, 2, 3]),
    delete: () => mockDelete(uri),
  })),
}));

const book = { id: 'b1', name: 'Personal', currency: 'BDT', isDefault: true, createdAt: '2026-01-01T00:00:00.000Z' };
const conversation = { id: 'c1', bookId: 'b1', title: 'Chat', currency: 'BDT', messages: [], hasMore: false };
const recording = { uri: 'file:///note.m4a', durationSeconds: 12, sizeBytes: 3, mimeType: 'audio/mp4' as const };
const url = '/conversations/c1/voice';

function reply(state: string, charged = 1) {
  return {
    userMessage: { id: 'u1', role: 'user', createdAt: '2026-11-11T06:00:00.000Z', artifacts: [{ id: 'v', type: 'voice', data: { state, durationSeconds: 12, clientAudioId: 'key-1', transcript: state === 'transcribed' ? 'Spent 250' : null } }] },
    aiMessage: { id: 'a1', role: 'ai', text: 'ok', createdAt: '2026-11-11T06:00:01.000Z' },
    credits: { charged, balance: 9 },
  };
}

describe('voice upload', () => {
  let mock: MockAdapter;
  let queryClient: QueryClient;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
    mockDelete.mockClear();
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    queryClient.setQueryData(['books'], [book]);
    queryClient.setQueryData(openConversationQueryKey('b1'), conversation);
    mock.onGet('/conversations/c1').reply(200, conversation);
    let count = 0;
    jest.mocked(randomUUID).mockImplementation(() => `key-${++count}` as ReturnType<typeof randomUUID>);
    act(() => {
      useActiveBookStore.setState({ activeBookId: 'b1' });
      useAssistantStore.setState({ pending: null, selection: null, isOpen: false });
    });
  });

  afterEach(() => {
    mock.restore();
    queryClient.clear();
  });

  function setup() {
    const wrapper = ({ children }: { children: React.ReactNode }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    return renderHook(() => useSendMessage(), { wrapper }).result;
  }

  const audioIds = () => mock.history.post.map(request => request.headers?.['x-client-audio-id']);

  it('uploads the file with audio headers and deletes it after a transcript', async () => {
    mock.onPost(url).reply(201, reply('transcribed'));
    const result = setup();
    act(() => void result.current.sendRecording(recording));
    await waitFor(() => expect(useAssistantStore.getState().pending).toBeNull());
    expect(mock.history.post[0].headers).toMatchObject({ 'Content-Type': 'application/octet-stream', 'x-audio-type': 'audio/mp4', 'x-client-audio-id': 'key-1' });
    expect(mockDelete).toHaveBeenCalledWith(recording.uri);
  });

  it('deletes the file when no speech was detected', async () => {
    mock.onPost(url).reply(201, reply('no_speech', 0));
    const result = setup();
    act(() => void result.current.sendRecording(recording));
    await waitFor(() => expect(useAssistantStore.getState().pending).toBeNull());
    expect(mockDelete).toHaveBeenCalledWith(recording.uri);
  });

  it('keeps the file and retries a failed transcription with a new key', async () => {
    mock.onPost(url).replyOnce(201, reply('failed', 0)).onPost(url).reply(201, reply('transcribed'));
    const result = setup();
    act(() => void result.current.sendRecording(recording));
    await waitFor(() => expect(useAssistantStore.getState().pending?.failure?.reason).toBe('transcription'));
    expect(mockDelete).not.toHaveBeenCalled();
    act(() => result.current.retry());
    await waitFor(() => expect(useAssistantStore.getState().pending).toBeNull());
    expect(audioIds()).toEqual(['key-1', 'key-2']);
  });

  it('keeps the file and reuses the key after an uncertain failure', async () => {
    mock.onPost(url).replyOnce(504).onPost(url).reply(201, reply('transcribed'));
    const result = setup();
    act(() => void result.current.sendRecording(recording));
    await waitFor(() => expect(useAssistantStore.getState().pending?.failure?.reason).toBe('uncertain'));
    expect(mockDelete).not.toHaveBeenCalled();
    act(() => result.current.retry());
    await waitFor(() => expect(useAssistantStore.getState().pending).toBeNull());
    expect(audioIds()).toEqual(['key-1', 'key-1']);
  });

  it('says the recording is too large on 413', async () => {
    mock.onPost(url).reply(413);
    const result = setup();
    act(() => void result.current.sendRecording(recording));
    await waitFor(() => expect(useAssistantStore.getState().pending?.failure?.reason).toBe('too_large'));
  });
});
