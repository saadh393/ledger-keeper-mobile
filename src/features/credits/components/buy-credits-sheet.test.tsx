import MockAdapter from 'axios-mock-adapter';
import * as React from 'react';
import { showMessage } from 'react-native-flash-message';
import Purchases, { PURCHASES_ERROR_CODE } from 'react-native-purchases';
import { useAuthStore } from '@/features/auth';
import { BuyCreditsSheet } from '@/features/credits/components/buy-credits-sheet';
import { apiClient } from '@/lib/api/client';
import { act, fireEvent, render, screen } from '@/lib/test-utils';

jest.mock('react-native-flash-message', () => ({ showMessage: jest.fn() }));
jest.mock('@/features/credits/api/ensure-purchases-user', () => ({ ensurePurchasesUser: jest.fn(async () => {}) }));

const pack = { identifier: 'starter', product: { identifier: 'credits_500', priceString: '৳600.00' } };

function purchasesError(code: string) {
  return { code, message: 'x' };
}

describe('buyCreditsSheet', () => {
  let mock: MockAdapter;
  let balances: number[];

  beforeEach(() => {
    jest.useFakeTimers();
    mock = new MockAdapter(apiClient);
    balances = [50];
    mock.onGet('/users/me').reply(200, { id: 'user-1', name: 'A', email: 'a@b.c', image: null, role: 'user', locale: 'en', currency: 'BDT', currencyConfirmed: true, defaultBookId: null, createdAt: '2026-01-01T00:00:00.000Z' });
    mock.onGet('/plans').reply(200, { items: [{ id: 'p1', code: 'credits_500', name: 'Starter', description: null, credits: 500, priceUsdCents: 500, sortOrder: 1 }] });
    mock.onGet('/credits/me').reply(() => [200, { balance: balances.length > 1 ? balances.shift() : balances[0], held: 0, lifetimeGranted: 0, lifetimeSpent: 0 }]);
    jest.mocked(Purchases.getOfferings).mockResolvedValue({ all: {}, current: { availablePackages: [pack] } } as never);
    jest.mocked(Purchases.purchasePackage).mockReset().mockResolvedValue({} as never);
    jest.mocked(showMessage).mockClear();
    useAuthStore.setState({ status: 'signedIn' });
  });

  afterEach(() => {
    mock.restore();
    jest.useRealTimers();
    act(() => useAuthStore.setState({ status: 'idle' }));
  });

  async function openAndBuy() {
    render(<BuyCreditsSheet onDismiss={jest.fn()} />);
    fireEvent.press(await screen.findByTestId('buy-credits-pack-starter'));
  }

  it('lists packs with the store price', async () => {
    render(<BuyCreditsSheet onDismiss={jest.fn()} />);
    expect(await screen.findByText('Starter')).toBeOnTheScreen();
    expect(screen.getByText('500 credits')).toBeOnTheScreen();
    expect(screen.getByText('৳600.00')).toBeOnTheScreen();
  });

  it('shows unavailable when the offering cannot load', async () => {
    jest.mocked(Purchases.getOfferings).mockRejectedValue(new Error('no play store'));
    render(<BuyCreditsSheet onDismiss={jest.fn()} />);
    expect(await screen.findByText('Purchases aren\'t available right now')).toBeOnTheScreen();
  });

  it('polls the balance after purchase and shows credits added', async () => {
    balances = [50, 50, 550];
    await openAndBuy();
    expect(await screen.findByTestId('buy-credits-pending')).toBeOnTheScreen();
    fireEvent.press(screen.getByTestId('buy-credits-pack-starter'));
    await act(async () => {
      await jest.advanceTimersByTimeAsync(4000);
    });
    expect(Purchases.purchasePackage).toHaveBeenCalledTimes(1);
    expect(showMessage).toHaveBeenCalledWith(expect.objectContaining({ type: 'success', message: '500 credits added' }));
  });

  it('shows processing when the balance does not change in 30 seconds', async () => {
    await openAndBuy();
    await act(async () => {
      await jest.advanceTimersByTimeAsync(31000);
    });
    expect(await screen.findByText('Payment is processing; credits will appear shortly')).toBeOnTheScreen();
    expect(showMessage).not.toHaveBeenCalled();
  });

  it('returns to the sheet quietly when cancelled', async () => {
    jest.mocked(Purchases.purchasePackage).mockRejectedValue(purchasesError(PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR));
    await openAndBuy();
    await act(async () => {
      await jest.advanceTimersByTimeAsync(0);
    });
    expect(screen.queryByTestId('buy-credits-notice')).toBeNull();
    expect(screen.queryByTestId('buy-credits-pending')).toBeNull();
  });

  it('shows the pending payment message', async () => {
    jest.mocked(Purchases.purchasePackage).mockRejectedValue(purchasesError(PURCHASES_ERROR_CODE.PAYMENT_PENDING_ERROR));
    await openAndBuy();
    expect(await screen.findByText('Your payment is pending. Credits are added when it completes.')).toBeOnTheScreen();
  });

  it('shows a readable store error and stays usable', async () => {
    jest.mocked(Purchases.purchasePackage).mockRejectedValue(purchasesError(PURCHASES_ERROR_CODE.STORE_PROBLEM_ERROR));
    await openAndBuy();
    expect(await screen.findByText('Google Play Billing isn\'t available on this device.')).toBeOnTheScreen();
    expect(screen.getByTestId('buy-credits-pack-starter')).toBeEnabled();
  });
});
