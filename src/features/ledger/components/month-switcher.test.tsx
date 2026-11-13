import type { AppStateStatus } from 'react-native';
import { AppState } from 'react-native';
import { useAuthStore } from '@/features/auth';
import { useActiveBookStore } from '@/features/books';
import { HomeScreen } from '@/features/home/home-screen';
import { MonthSwitcher } from '@/features/ledger/components/month-switcher';
import i18n from '@/lib/i18n';
import { act, fireEvent, render, screen } from '@/lib/test-utils';

const lastMinuteOfNovember = new Date('2026-11-30T17:59:00Z');
const firstMinuteOfDecember = new Date('2026-11-30T18:01:00Z');

let appStateListeners: Array<(state: AppStateStatus) => void> = [];

function emitAppState(state: AppStateStatus) {
  act(() => {
    appStateListeners.forEach(listener => listener(state));
  });
}

function Ledger() {
  return (
    <>
      <MonthSwitcher />
      <HomeScreen />
    </>
  );
}

function thisMonth() {
  return screen.queryByTestId('month-switcher-this-month');
}

function label() {
  return screen.getByTestId('month-switcher-label');
}

function press(element: ReturnType<typeof screen.getByLabelText>) {
  fireEvent.press(element);
  act(() => {
    jest.runAllTicks();
    jest.runOnlyPendingTimers();
  });
}

function pressPrevious() {
  press(screen.getByLabelText('Previous month'));
}

function pressNext() {
  press(screen.getByLabelText('Next month'));
}

beforeEach(() => {
  useAuthStore.setState({ status: 'idle' });
  jest.useFakeTimers({ now: new Date('2026-11-15T06:00:00Z') });
  appStateListeners = [];
  jest.spyOn(AppState, 'addEventListener').mockImplementation((type, listener) => {
    if (type === 'change')
      appStateListeners.push(listener as (state: AppStateStatus) => void);
    return { remove: () => {
      appStateListeners = appStateListeners.filter(item => item !== listener);
    } };
  });
});

afterEach(async () => {
  jest.useRealTimers();
  jest.restoreAllMocks();
  await act(() => i18n.changeLanguage('en'));
});

describe('monthSwitcher navigation', () => {
  it('opens on the current Dhaka month', () => {
    render(<Ledger />);
    expect(label()).toHaveTextContent('November 2026');
  });

  it('opens on the Dhaka month while New York is still in the previous month', () => {
    jest.setSystemTime(firstMinuteOfDecember);
    expect(new Date().getMonth()).toBe(10);
    render(<Ledger />);
    expect(label()).toHaveTextContent('December 2026');
  });

  it('shows the month in Bangla', async () => {
    await act(() => i18n.changeLanguage('bn'));
    render(<Ledger />);
    expect(label()).toHaveTextContent('নভেম্বর ২০২৬');
    expect(screen.getByLabelText('আগের মাস')).toBeOnTheScreen();
    expect(screen.getByLabelText('পরের মাস')).toBeOnTheScreen();
    press(screen.getByLabelText('আগের মাস'));
    expect(label()).toHaveTextContent('অক্টোবর ২০২৬');
    expect(thisMonth()!).toBeOnTheScreen();
    press(thisMonth()!);
    expect(label()).toHaveTextContent('নভেম্বর ২০২৬');
    expect(thisMonth()).not.toBeOnTheScreen();
  });

  it('disables next and hides This month on the current month', () => {
    render(<Ledger />);
    const next = screen.getByLabelText('Next month');
    expect(next).toBeDisabled();
    expect(next.props.accessibilityState).toMatchObject({ disabled: true });
    expect(next.props.className).toContain('opacity-40');
    pressNext();
    expect(label()).toHaveTextContent('November 2026');
    expect(thisMonth()).toBeNull();
  });

  it('moves back across years and forward again', () => {
    jest.setSystemTime(new Date('2026-01-10T06:00:00Z'));
    render(<Ledger />);
    expect(label()).toHaveTextContent('January 2026');
    pressPrevious();
    expect(label()).toHaveTextContent('December 2025');
    expect(screen.getByLabelText('Next month')).toBeEnabled();
    expect(screen.getByLabelText('Next month').props.accessibilityState).toMatchObject({ disabled: false });
    pressNext();
    expect(label()).toHaveTextContent('January 2026');
    expect(screen.getByLabelText('Next month')).toBeDisabled();
  });

  it('always allows going back', () => {
    render(<Ledger />);
    for (let index = 0; index < 13; index++)
      pressPrevious();
    expect(label()).toHaveTextContent('October 2025');
  });

  it('shows This month only on a past month and jumps back with it', () => {
    render(<Ledger />);
    pressPrevious();
    pressPrevious();
    expect(label()).toHaveTextContent('September 2026');
    press(thisMonth()!);
    expect(label()).toHaveTextContent('November 2026');
    expect(thisMonth()).toBeNull();
  });
});

describe('monthSwitcher lifecycle', () => {
  it('updates the current month when the app returns after month end', () => {
    jest.setSystemTime(lastMinuteOfNovember);
    render(<Ledger />);
    expect(screen.getByLabelText('Next month')).toBeDisabled();
    jest.setSystemTime(firstMinuteOfDecember);
    emitAppState('background');
    expect(screen.getByLabelText('Next month')).toBeDisabled();
    emitAppState('active');
    expect(label()).toHaveTextContent('November 2026');
    expect(screen.getByLabelText('Next month')).toBeEnabled();
    expect(thisMonth()!).toBeOnTheScreen();
    pressNext();
    expect(label()).toHaveTextContent('December 2026');
    expect(screen.getByLabelText('Next month')).toBeDisabled();
  });

  it('keeps a past month and updates the controls when the app returns after month end', () => {
    jest.setSystemTime(lastMinuteOfNovember);
    render(<Ledger />);
    pressPrevious();
    expect(label()).toHaveTextContent('October 2026');
    jest.setSystemTime(firstMinuteOfDecember);
    emitAppState('active');
    expect(label()).toHaveTextContent('October 2026');
    expect(thisMonth()!).toBeOnTheScreen();
    pressNext();
    expect(label()).toHaveTextContent('November 2026');
    expect(screen.getByLabelText('Next month')).toBeEnabled();
    pressNext();
    expect(label()).toHaveTextContent('December 2026');
    expect(screen.getByLabelText('Next month')).toBeDisabled();
    expect(thisMonth()).not.toBeOnTheScreen();
  });

  it('jumps to the new current month after month end', () => {
    jest.setSystemTime(lastMinuteOfNovember);
    render(<Ledger />);
    pressPrevious();
    jest.setSystemTime(firstMinuteOfDecember);
    press(thisMonth()!);
    expect(label()).toHaveTextContent('December 2026');
  });

  it('keeps the selected month when the book changes', () => {
    render(<Ledger />);
    pressPrevious();
    act(() => {
      useActiveBookStore.getState().setActiveBookId('book-2');
    });
    expect(label()).toHaveTextContent('October 2026');
    act(() => {
      useActiveBookStore.getState().setActiveBookId('book-3');
    });
    expect(label()).toHaveTextContent('October 2026');
  });

  it('opens on the current month again after a restart', () => {
    const { unmount } = render(<Ledger />);
    pressPrevious();
    expect(label()).toHaveTextContent('October 2026');
    unmount();
    render(<Ledger />);
    expect(label()).toHaveTextContent('November 2026');
  });

  it('gives the arrows and the month label 44 dp touch targets', () => {
    render(<Ledger />);
    pressPrevious();
    [screen.getByLabelText('Previous month'), screen.getByLabelText('Next month')].forEach((button) => {
      expect(button.props.accessibilityRole).toBe('button');
      expect(button.props.className).toContain('h-11');
      expect(button.props.className).toContain('w-9');
      expect(button.props.hitSlop).toMatchObject({ left: 4, right: 4 });
    });
    const back = thisMonth()!;
    expect(back.props.className).toContain('h-11');
    expect(back.props.accessibilityRole).toBe('button');
    expect(back).toHaveAccessibleName('October 2026, This month');
  });
});
