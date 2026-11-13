import MockAdapter from 'axios-mock-adapter';
import * as React from 'react';
import { useAuthStore } from '@/features/auth';
import { DetectedInboxButton } from '@/features/auto-capture/components/detected-inbox-button';
import { useActiveBookStore } from '@/features/books/store/use-active-book-store';
import { apiClient } from '@/lib/api/client';
import { act, render, screen } from '@/lib/test-utils';

jest.mock('@/features/auto-capture/native/notification-capture');
jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn() }) }));

describe('detectedInboxButton', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
    mock.onGet('/books').reply(200, { items: [{ id: 'book-1', name: 'Personal', currency: 'BDT', isDefault: true, createdAt: '2026-01-01T00:00:00.000Z' }] });
    useAuthStore.setState({ status: 'signedIn' });
    useActiveBookStore.setState({ activeBookId: 'book-1' });
  });

  afterEach(() => {
    mock.restore();
    act(() => {
      useAuthStore.setState({ status: 'idle' });
      useActiveBookStore.setState({ activeBookId: null });
    });
  });

  it('shows 99+ above 99 pending items', async () => {
    mock.onGet('/books/book-1/captures').reply(200, { items: [], total: 140, page: 1, pageSize: 1 });
    render(<DetectedInboxButton />);
    expect(await screen.findByTestId('detected-inbox-badge')).toHaveTextContent('99+');
  });

  it('shows no badge when nothing is pending', async () => {
    mock.onGet('/books/book-1/captures').reply(200, { items: [], total: 0, page: 1, pageSize: 1 });
    render(<DetectedInboxButton />);
    expect(await screen.findByTestId('detected-inbox-button')).toBeOnTheScreen();
    expect(screen.queryByTestId('detected-inbox-badge')).toBeNull();
  });
});
