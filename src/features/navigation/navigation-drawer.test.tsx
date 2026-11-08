/* eslint-disable max-lines-per-function */
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';
import * as React from 'react';
import { BackHandler } from 'react-native';
import { Easing, ReduceMotion, withTiming } from 'react-native-reanimated';
import { useAuthStore } from '@/features/auth';
import { HomeScreen } from '@/features/home/home-screen';
import {
  AppDrawerContent,
  DRAWER_ANIMATION_DURATION,
  DRAWER_SCRIM_COLOR,
  DRAWER_WIDTH,
  NAV_ITEMS,
  SectionPlaceholder,
  SectionTopBar,
} from '@/features/navigation';
import { apiClient } from '@/lib/api/client';
import { act, fireEvent, screen } from '@/lib/test-utils';

const Drawer = createDrawerNavigator();

function LoansTestScreen() {
  return <SectionPlaceholder title="Loans" />;
}

function InstallmentsTestScreen() {
  return <SectionPlaceholder title="Installments" />;
}

function TestDrawerNavigator({ initialRouteName = 'index' }: { initialRouteName?: string }) {
  return (
    <Drawer.Navigator
      initialRouteName={initialRouteName}
      backBehavior="initialRoute"
      drawerContent={props => <AppDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        header: ({ navigation, route, options }) => (
          <SectionTopBar
            title={options.title ?? route.name}
            onOpenMenu={() => (navigation as any).openDrawer()}
          />
        ),
        drawerStyle: {
          width: DRAWER_WIDTH,
        },
        overlayColor: DRAWER_SCRIM_COLOR,
        swipeEdgeWidth: 32,
        swipeEnabled: true,
      }}
    >
      <Drawer.Screen name="index" component={HomeScreen} options={{ title: 'Ledger' }} />
      <Drawer.Screen name="loans" component={LoansTestScreen} options={{ title: 'Loans' }} />
      <Drawer.Screen name="installments" component={InstallmentsTestScreen} options={{ title: 'Installments' }} />
    </Drawer.Navigator>
  );
}

describe('navigationDrawer integration', () => {
  let mockApi: MockAdapter;
  let testQueryClient: QueryClient;

  beforeEach(() => {
    mockApi = new MockAdapter(apiClient);
    testQueryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    useAuthStore.setState({ status: 'signedIn' });
    mockApi.onGet('/users/me').reply(200, {
      id: 'u-1',
      name: 'Test User',
      email: 'test@example.com',
      currencyConfirmed: true,
    });
  });

  afterEach(() => {
    mockApi.restore();
    testQueryClient.clear();
    act(() => {
      useAuthStore.setState({ status: 'idle' });
    });
  });

  describe('configuration tokens and constants', () => {
    it('uses 288 width, rgba(0,0,0,0.4) scrim, and 240 ms animation duration', () => {
      expect(DRAWER_WIDTH).toBe(288);
      expect(DRAWER_SCRIM_COLOR).toBe('rgba(0, 0, 0, 0.4)');
      expect(DRAWER_ANIMATION_DURATION).toBe(240);
    });

    it('contains all five main navigation items in order', () => {
      const names = NAV_ITEMS.map(item => item.name);
      expect(names).toEqual(['index', 'loans', 'installments', 'credits', 'settings']);
    });
  });

  describe('android back button behavior (Criterion 9)', () => {
    it('registers back handler that calls BackHandler.exitApp on Ledger', () => {
      const exitAppSpy = jest.spyOn(BackHandler, 'exitApp').mockImplementation(() => {});
      const addListenerSpy = jest.spyOn(BackHandler, 'addEventListener');

      const { render: rawRender } = jest.requireActual('@testing-library/react-native');

      rawRender(
        <QueryClientProvider client={testQueryClient}>
          <NavigationContainer>
            <TestDrawerNavigator initialRouteName="index" />
          </NavigationContainer>
        </QueryClientProvider>,
      );

      expect(screen.getAllByText('Ledger Keeper').length).toBeGreaterThanOrEqual(1);

      const backCalls = addListenerSpy.mock.calls.filter(
        call => call[0] === 'hardwareBackPress',
      );
      expect(backCalls.length).toBeGreaterThan(0);

      // Invoke the back handler registered by HomeScreen
      const homeHandler = backCalls.map(c => c[1]).find((h) => {
        exitAppSpy.mockClear();
        const res = h();
        return res === true && exitAppSpy.mock.calls.length > 0;
      });

      expect(homeHandler).toBeDefined();

      addListenerSpy.mockRestore();
      exitAppSpy.mockRestore();
    });

    it('goes back to Ledger when navigating from another section', async () => {
      const { render: rawRender } = jest.requireActual('@testing-library/react-native');

      rawRender(
        <QueryClientProvider client={testQueryClient}>
          <NavigationContainer>
            <TestDrawerNavigator initialRouteName="loans" />
          </NavigationContainer>
        </QueryClientProvider>,
      );

      expect(screen.getByTestId('section-placeholder-title')).toHaveTextContent('Loans');

      // Tapping open menu opens the drawer
      const menuButton = screen.getByTestId('top-bar-menu-button');
      fireEvent.press(menuButton);

      // Ledger is available in drawer and tapping it navigates to Ledger
      const ledgerNavItem = screen.getByTestId('drawer-nav-ledger');
      fireEvent.press(ledgerNavItem);

      expect(screen.getAllByText('Ledger Keeper').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('drawer animation configuration (Criterion 11)', () => {
    it('animates opening/closing with 240 ms timing, bezier(0.2,0,0,1), and system reduce-motion', () => {
      const withTimingSpy = jest.mocked(withTiming);
      const bezierSpy = jest.mocked(Easing.bezier);
      withTimingSpy.mockClear();
      bezierSpy.mockClear();

      const { render: rawRender } = jest.requireActual('@testing-library/react-native');

      rawRender(
        <QueryClientProvider client={testQueryClient}>
          <NavigationContainer>
            <TestDrawerNavigator initialRouteName="loans" />
          </NavigationContainer>
        </QueryClientProvider>,
      );

      const menuButton = screen.getByTestId('top-bar-menu-button');
      fireEvent.press(menuButton);

      expect(bezierSpy).toHaveBeenCalledWith(0.2, 0, 0, 1);
      expect(withTimingSpy).toHaveBeenCalledWith(
        expect.any(Number),
        expect.objectContaining({
          duration: 240,
          reduceMotion: ReduceMotion.System,
        }),
        expect.any(Function),
      );
    });
  });
});
