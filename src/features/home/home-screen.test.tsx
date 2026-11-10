import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';
import { useAuthStore } from '@/features/auth';
import { HomeScreen } from '@/features/home/home-screen';
import { apiClient } from '@/lib/api/client';
import i18n from '@/lib/i18n';
import { act, fireEvent, render, screen, waitFor } from '@/lib/test-utils';

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

describe('homeScreen basic layout and currency', () => {
  let mock: MockAdapter;
  let testQueryClient: QueryClient;

  beforeEach(() => {
    useAuthStore.setState({ status: 'idle' });
    mock = new MockAdapter(apiClient);
    testQueryClient = createTestQueryClient();
  });

  afterEach(async () => {
    mock.restore();
    testQueryClient.clear();
    act(() => {
      useAuthStore.setState({ status: 'idle' });
    });
    await act(() => i18n.changeLanguage('en'));
  });

  it('shows the month switcher, stat tiles, search toolbar and the transaction list placeholders', () => {
    render(<HomeScreen />);
    expect(screen.getByTestId('month-switcher')).toBeOnTheScreen();
    expect(screen.getByTestId('ledger-stats')).toBeOnTheScreen();
    expect(screen.getByTestId('ledger-toolbar')).toBeOnTheScreen();
    expect(screen.getAllByTestId('ledger-row-placeholder')).toHaveLength(6);
  });

  it('opens currency picker sheet when currencyConfirmed is false', async () => {
    useAuthStore.setState({ status: 'signedIn' });
    mock.onGet('/users/me').reply(200, {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      image: null,
      role: 'user',
      locale: 'en',
      currency: 'BDT',
      currencyConfirmed: false,
      defaultBookId: 'book-1',
      createdAt: '2026-01-01T00:00:00.000Z',
    });

    render(
      <QueryClientProvider client={testQueryClient}>
        <HomeScreen />
      </QueryClientProvider>,
    );

    expect(screen.getByTestId('month-switcher')).toBeOnTheScreen();

    await waitFor(() => {
      expect(screen.getByTestId('currency-picker-sheet')).toBeOnTheScreen();
    });

    expect(screen.getByText('Choose your currency')).toBeOnTheScreen();
  });

  it('does not open currency picker sheet when currencyConfirmed is true', async () => {
    useAuthStore.setState({ status: 'signedIn' });
    mock.onGet('/users/me').reply(200, {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      image: null,
      role: 'user',
      locale: 'en',
      currency: 'BDT',
      currencyConfirmed: true,
      defaultBookId: 'book-1',
      createdAt: '2026-01-01T00:00:00.000Z',
    });

    render(
      <QueryClientProvider client={testQueryClient}>
        <HomeScreen />
      </QueryClientProvider>,
    );

    expect(screen.getByTestId('month-switcher')).toBeOnTheScreen();

    await waitFor(() => {
      expect(screen.queryByTestId('currency-picker-sheet')).not.toBeOnTheScreen();
    });

    expect(screen.queryByText('Choose your currency')).toBeNull();
  });
});

describe('homeScreen transaction actions', () => {
  let mock: MockAdapter;
  let testQueryClient: QueryClient;

  beforeEach(() => {
    useAuthStore.setState({ status: 'idle' });
    mock = new MockAdapter(apiClient);
    testQueryClient = createTestQueryClient();
  });

  afterEach(async () => {
    mock.restore();
    testQueryClient.clear();
    act(() => {
      useAuthStore.setState({ status: 'idle' });
    });
    await act(() => i18n.changeLanguage('en'));
  });

  it('opens Add transaction sheet when the floating pill is tapped', async () => {
    useAuthStore.setState({ status: 'signedIn' });
    mock.onGet('/books').reply(200, {
      items: [{ id: 'book-1', name: 'Personal', currency: 'BDT', isDefault: true, createdAt: '2026-01-01T00:00:00.000Z' }],
    });
    mock.onGet('/users/me').reply(200, {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      image: null,
      role: 'user',
      locale: 'en',
      currency: 'BDT',
      currencyConfirmed: true,
      defaultBookId: 'book-1',
      createdAt: '2026-01-01T00:00:00.000Z',
    });
    mock.onGet('/categories').reply(200, []);

    render(
      <QueryClientProvider client={testQueryClient}>
        <HomeScreen />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(mock.history.get.some(req => req.url === '/books')).toBe(true);
    });

    const addButton = screen.getByTestId('ledger-add-transaction-button');
    expect(addButton).toBeOnTheScreen();
    fireEvent.press(addButton);

    await waitFor(() => {
      expect(screen.getByTestId('transaction-form-sheet')).toBeOnTheScreen();
      expect(screen.getByTestId('transaction-form-sheet-title')).toHaveTextContent('Add transaction');
    });
  });
});
