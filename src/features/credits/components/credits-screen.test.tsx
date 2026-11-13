import MockAdapter from 'axios-mock-adapter';
import * as React from 'react';
import { CreditsScreen } from '@/features/credits/components/credits-screen';
import { apiClient } from '@/lib/api/client';
import { render, screen } from '@/lib/test-utils';

jest.mock('react-native-safe-area-context', () => ({
  ...jest.requireActual('react-native-safe-area-context'),
  useSafeAreaInsets: jest.fn(() => ({ top: 24, bottom: 34, left: 0, right: 0 })),
}));

const voiceOperation = { id: 'op1', type: 'voice', status: 'captured', chargedCredits: 4 };

const ledgerPage = {
  items: [
    { id: 'e3', type: 'release', amount: 2, balanceAfter: 56, note: null, operation: voiceOperation, purchase: null, createdAt: '2026-11-12T10:00:05.000Z' },
    { id: 'e2', type: 'reserve', amount: -6, balanceAfter: 54, note: null, operation: voiceOperation, purchase: null, createdAt: '2026-11-12T10:00:00.000Z' },
    { id: 'e1', type: 'purchase', amount: 500, balanceAfter: 60, note: null, operation: null, purchase: { id: 'p1', planName: 'Starter' }, createdAt: '2026-11-11T10:00:00.000Z' },
  ],
  total: 3,
  page: 1,
  pageSize: 25,
};

describe('creditsScreen', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
  });

  afterEach(() => {
    mock.restore();
  });

  it('shows balance, held credits, collapsed history and usage', async () => {
    mock.onGet('/credits/me').reply(200, { balance: 56, held: 6, lifetimeGranted: 560, lifetimeSpent: 504 });
    mock.onGet('/credits/ledger').reply(200, ledgerPage);
    mock.onGet('/credits/usage').reply(200, { totals: [{ type: 'voice', operations: 1, credits: 4 }], points: [{ date: new Date().toISOString(), credits: 4 }] });
    render(<CreditsScreen />);

    expect(await screen.findByTestId('credits-balance-value')).toHaveTextContent('56');
    expect(screen.getByTestId('credits-balance-held')).toHaveTextContent('6 reserved by requests in progress');
    expect(await screen.findByText('Voice note · 4 credits')).toBeOnTheScreen();
    expect(screen.getAllByText('Voice note · 4 credits')).toHaveLength(1);
    expect(screen.getByText('Bought Starter')).toBeOnTheScreen();
    expect(screen.getByText('+500')).toBeOnTheScreen();
    expect(await screen.findByTestId('trend-chart')).toBeOnTheScreen();
  });

  it('keeps other sections when one fails', async () => {
    mock.onGet('/credits/me').reply(200, { balance: 10, held: 0, lifetimeGranted: 10, lifetimeSpent: 0 });
    mock.onGet('/credits/ledger').reply(500);
    mock.onGet('/credits/usage').reply(200, { totals: [], points: [] });
    render(<CreditsScreen />);

    expect(await screen.findByTestId('credits-balance-value')).toHaveTextContent('10');
    expect(screen.queryByTestId('credits-balance-held')).toBeNull();
    expect(await screen.findByTestId('credits-history-error')).toBeOnTheScreen();
    expect(await screen.findByText('No usage in the last 30 days')).toBeOnTheScreen();
  });

  it('shows the empty history state', async () => {
    mock.onGet('/credits/me').reply(500);
    mock.onGet('/credits/ledger').reply(200, { items: [], total: 0, page: 1, pageSize: 25 });
    mock.onGet('/credits/usage').reply(200, { totals: [], points: [] });
    render(<CreditsScreen />);

    expect(await screen.findByText('No credit activity yet')).toBeOnTheScreen();
    expect(await screen.findByTestId('credits-balance-error')).toBeOnTheScreen();
  });
});
