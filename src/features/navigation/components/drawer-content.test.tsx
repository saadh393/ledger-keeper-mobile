/* eslint-disable max-lines-per-function */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';
import * as React from 'react';
import { Dimensions } from 'react-native';
import { useAuthStore } from '@/features/auth';
import { AppDrawerContent } from '@/features/navigation/components/drawer-content';
import { apiClient } from '@/lib/api/client';
import i18n from '@/lib/i18n';
import { act, fireEvent, render, screen, waitFor } from '@/lib/test-utils';

describe('appDrawerContent', () => {
  let mockApi: MockAdapter;
  let testQueryClient: QueryClient;

  const createMockNavigation = () => ({
    navigate: jest.fn(),
    closeDrawer: jest.fn(),
    openDrawer: jest.fn(),
    dispatch: jest.fn(),
  });

  const createMockState = (activeIndex = 0) => ({
    index: activeIndex,
    routes: [
      { key: 'index-key', name: 'index' },
      { key: 'loans-key', name: 'loans' },
      { key: 'installments-key', name: 'installments' },
      { key: 'credits-key', name: 'credits' },
      { key: 'settings-key', name: 'settings' },
    ],
    routeNames: ['index', 'loans', 'installments', 'credits', 'settings'],
    type: 'drawer',
    key: 'drawer-key',
    stale: false,
    history: [],
    preloadedRouteKeys: [],
  });

  beforeEach(() => {
    mockApi = new MockAdapter(apiClient);
    testQueryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    useAuthStore.setState({ status: 'signedIn' });
    mockApi.onGet('/books').reply(200, {
      items: [
        {
          id: 'b-default',
          name: 'Personal Expenses',
          currency: 'BDT',
          isDefault: true,
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ],
    });
  });

  afterEach(async () => {
    mockApi.restore();
    testQueryClient.clear();
    act(() => {
      useAuthStore.setState({ status: 'idle' });
    });
    await act(() => i18n.changeLanguage('en'));
  });

  function renderDrawer(navigation = createMockNavigation(), state = createMockState()) {
    return render(
      <QueryClientProvider client={testQueryClient}>
        <AppDrawerContent
          navigation={navigation as any}
          state={state as any}
          descriptors={{} as any}
        />
      </QueryClientProvider>,
    );
  }

  describe('structure and layout', () => {
    it('renders top to bottom: logo row, book switcher slot, nav rows, profile footer', async () => {
      mockApi.onGet('/users/me').reply(200, {
        id: 'u1',
        name: 'John Doe',
        email: 'john@example.com',
      });

      renderDrawer();

      expect(screen.getByTestId('drawer-logo-row')).toBeOnTheScreen();
      expect(screen.getByTestId('drawer-app-title')).toHaveTextContent('Ledger Keeper');
      expect(screen.getByTestId('drawer-book-switcher-slot')).toBeOnTheScreen();
      expect(screen.getByTestId('drawer-nav-items')).toBeOnTheScreen();

      await waitFor(() => {
        expect(screen.getByTestId('drawer-profile-footer')).toBeOnTheScreen();
      });
      expect(screen.getByTestId('drawer-profile-name')).toHaveTextContent('John Doe');
      expect(screen.getByTestId('drawer-profile-email')).toHaveTextContent('john@example.com');
    });

    it('has width at most 288 dp and never exceeds screen width', () => {
      renderDrawer();
      const drawer = screen.getByTestId('app-drawer-content');
      const windowWidth = Dimensions.get('window').width;
      const expectedWidth = Math.min(288, windowWidth);
      expect(drawer.props.style).toEqual(
        expect.objectContaining({ width: expectedWidth }),
      );
    });

    it('translates app title to Bangla', async () => {
      await act(() => i18n.changeLanguage('bn'));
      renderDrawer();
      expect(screen.getByTestId('drawer-app-title')).toHaveTextContent('লেজার কিপার');
    });

    it('renders book switcher with active book inside drawer slot and opens sheet on tap', async () => {
      renderDrawer();

      await waitFor(() => {
        expect(screen.getByTestId('book-switcher-trigger')).toBeOnTheScreen();
      });

      expect(screen.getByTestId('book-switcher-active-name')).toHaveTextContent('Personal Expenses');
      expect(screen.getByTestId('book-switcher-active-currency')).toHaveTextContent('BDT');

      fireEvent.press(screen.getByTestId('book-switcher-trigger'));
      expect(screen.getByTestId('book-switcher-sheet')).toBeOnTheScreen();
      expect(screen.getByTestId('book-item-b-default')).toBeOnTheScreen();
    });
  });

  describe('nav rows', () => {
    it('renders all 5 section rows with Lucide icons', () => {
      renderDrawer();

      expect(screen.getByTestId('drawer-nav-ledger')).toBeOnTheScreen();
      expect(screen.getByTestId('drawer-nav-ledger-icon')).toBeOnTheScreen();

      expect(screen.getByTestId('drawer-nav-loans')).toBeOnTheScreen();
      expect(screen.getByTestId('drawer-nav-loans-icon')).toBeOnTheScreen();

      expect(screen.getByTestId('drawer-nav-installments')).toBeOnTheScreen();
      expect(screen.getByTestId('drawer-nav-installments-icon')).toBeOnTheScreen();

      expect(screen.getByTestId('drawer-nav-credits')).toBeOnTheScreen();
      expect(screen.getByTestId('drawer-nav-credits-icon')).toBeOnTheScreen();

      expect(screen.getByTestId('drawer-nav-settings')).toBeOnTheScreen();
      expect(screen.getByTestId('drawer-nav-settings-icon')).toBeOnTheScreen();
    });

    it('nav rows are pill-shaped with minimum height 44 dp', () => {
      renderDrawer();
      const rows = [
        screen.getByTestId('drawer-nav-ledger'),
        screen.getByTestId('drawer-nav-loans'),
        screen.getByTestId('drawer-nav-installments'),
        screen.getByTestId('drawer-nav-credits'),
        screen.getByTestId('drawer-nav-settings'),
      ];

      for (const row of rows) {
        expect(row.props.className).toContain('rounded-full');
        expect(row.props.className).toContain('min-h-[44px]');
      }
    });

    it('active row uses selected background and on-selected text, others use ink-700', () => {
      // index 0 is 'index' (Ledger)
      renderDrawer(createMockNavigation(), createMockState(0));

      const ledgerRow = screen.getByTestId('drawer-nav-ledger');
      const loansRow = screen.getByTestId('drawer-nav-loans');

      expect(ledgerRow.props.className).toContain('bg-selected');
      expect(ledgerRow.props.accessibilityState).toEqual({ selected: true });

      expect(loansRow.props.className).toContain('bg-transparent');
      expect(loansRow.props.accessibilityState).toEqual({ selected: false });
    });

    it('updates active styles when another section is current', () => {
      // index 1 is 'loans'
      renderDrawer(createMockNavigation(), createMockState(1));

      const ledgerRow = screen.getByTestId('drawer-nav-ledger');
      const loansRow = screen.getByTestId('drawer-nav-loans');

      expect(ledgerRow.props.className).toContain('bg-transparent');
      expect(ledgerRow.props.accessibilityState).toEqual({ selected: false });

      expect(loansRow.props.className).toContain('bg-selected');
      expect(loansRow.props.accessibilityState).toEqual({ selected: true });
    });

    it('translates nav row labels in Bangla', async () => {
      await act(() => i18n.changeLanguage('bn'));
      renderDrawer();

      expect(screen.getByText('লেজার')).toBeOnTheScreen();
      expect(screen.getByText('ঋণ')).toBeOnTheScreen();
      expect(screen.getByText('কিস্তি')).toBeOnTheScreen();
      expect(screen.getByText('ক্রেডিট')).toBeOnTheScreen();
      expect(screen.getByText('সেটিংস')).toBeOnTheScreen();
    });
  });

  describe('navigation interactions (Criterion 6 and 13)', () => {
    it('tapping each inactive row navigates to its route and closes the drawer', () => {
      const navigation = createMockNavigation();
      // current route is 'index' (Ledger)
      renderDrawer(navigation, createMockState(0));

      // 1. Tapping Loans
      fireEvent.press(screen.getByTestId('drawer-nav-loans'));
      expect(navigation.navigate).toHaveBeenCalledWith('loans');
      expect(navigation.closeDrawer).toHaveBeenCalledTimes(1);

      // 2. Tapping Installments
      fireEvent.press(screen.getByTestId('drawer-nav-installments'));
      expect(navigation.navigate).toHaveBeenCalledWith('installments');
      expect(navigation.closeDrawer).toHaveBeenCalledTimes(2);

      // 3. Tapping Credits
      fireEvent.press(screen.getByTestId('drawer-nav-credits'));
      expect(navigation.navigate).toHaveBeenCalledWith('credits');
      expect(navigation.closeDrawer).toHaveBeenCalledTimes(3);

      // 4. Tapping Settings
      fireEvent.press(screen.getByTestId('drawer-nav-settings'));
      expect(navigation.navigate).toHaveBeenCalledWith('settings');
      expect(navigation.closeDrawer).toHaveBeenCalledTimes(4);
    });

    it('tapping the current section only closes the drawer without navigating', () => {
      const navigation = createMockNavigation();
      // current route is 'index' (Ledger)
      renderDrawer(navigation, createMockState(0));

      fireEvent.press(screen.getByTestId('drawer-nav-ledger'));
      expect(navigation.navigate).not.toHaveBeenCalled();
      expect(navigation.closeDrawer).toHaveBeenCalledTimes(1);
    });

    it('tapping Ledger from another section navigates to index and closes drawer', () => {
      const navigation = createMockNavigation();
      // current route is 'settings' (index 4)
      renderDrawer(navigation, createMockState(4));

      fireEvent.press(screen.getByTestId('drawer-nav-ledger'));
      expect(navigation.navigate).toHaveBeenCalledWith('index');
      expect(navigation.closeDrawer).toHaveBeenCalledTimes(1);
    });
  });

  describe('profile footer (Criterion 10)', () => {
    it('shows placeholder while profile is loading', () => {
      // simulate slow query: no mock reply immediately
      mockApi.onGet('/users/me').reply(() => new Promise(() => {}));

      renderDrawer();

      expect(screen.getByTestId('drawer-profile-loading')).toBeOnTheScreen();
      expect(screen.queryByTestId('drawer-profile-footer')).toBeNull();
    });

    it('shows user name and email on success', async () => {
      mockApi.onGet('/users/me').reply(200, {
        id: 'u-1',
        name: 'Jane Eyre',
        email: 'jane@example.com',
      });

      renderDrawer();

      await waitFor(() => {
        expect(screen.getByTestId('drawer-profile-footer')).toBeOnTheScreen();
      });

      expect(screen.getByTestId('drawer-profile-name')).toHaveTextContent('Jane Eyre');
      expect(screen.getByTestId('drawer-profile-email')).toHaveTextContent('jane@example.com');
      expect(screen.getByTestId('drawer-profile-avatar')).toHaveTextContent('JE');
    });

    it('hides footer when profile query fails, while navigation still works', async () => {
      mockApi.onGet('/users/me').reply(500, { message: 'Server error' });

      const navigation = createMockNavigation();
      renderDrawer(navigation);

      await waitFor(() => {
        expect(screen.queryByTestId('drawer-profile-loading')).not.toBeOnTheScreen();
      });

      expect(screen.queryByTestId('drawer-profile-footer')).toBeNull();

      // Navigation rows still work cleanly
      fireEvent.press(screen.getByTestId('drawer-nav-credits'));
      expect(navigation.navigate).toHaveBeenCalledWith('credits');
      expect(navigation.closeDrawer).toHaveBeenCalledTimes(1);
    });
  });
});
