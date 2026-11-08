import type { AppStateStatus } from 'react-native';
import { AppState } from 'react-native';
import { useAuthStore } from '@/features/auth';
import { useActiveBookStore } from '@/features/books';
import { HomeScreen } from '@/features/home/home-screen';
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
    render(<HomeScreen />);
    expect(label()).toHaveTextContent('November 2026');
  });

  it('opens on the Dhaka month while New York is still in the previous month', () => {
    jest.setSystemTime(firstMinuteOfDecember);
    expect(new Date().getMonth()).toBe(10);
    render(<HomeScreen />);
    expect(label()).toHaveTextContent('December 2026');
  });

  it('shows the month in Bangla', async () => {
    await act(() => i18n.changeLanguage('bn'));
    render(<HomeScreen />);
    expect(label()).toHaveTextContent('নভেম্বর ২০২৬');
    expect(screen.getByLabelText('আগের মাস')).toBeOnTheScreen();
    expect(screen.getByLabelText('পরের মাস')).toBeOnTheScreen();
  });

  it('disables next and hides This month on the current month', () => {
    render(<HomeScreen />);
    const next = screen.getByLabelText('Next month');
    expect(next).toBeDisabled();
    expect(next.props.accessibilityState).toMatchObject({ disabled: true });
    expect(next.props.className).toContain('opacity-50');
    pressNext();
    expect(label()).toHaveTextContent('November 2026');
    expect(screen.queryByText('This month')).toBeNull();
  });

  it('moves back across years and forward again', () => {
    jest.setSystemTime(new Date('2026-01-10T06:00:00Z'));
    render(<HomeScreen />);
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
    render(<HomeScreen />);
    for (let index = 0; index < 13; index++)
      pressPrevious();
    expect(label()).toHaveTextContent('October 2025');
  });

  it('shows This month only on a past month and jumps back with it', () => {
    render(<HomeScreen />);
    pressPrevious();
    pressPrevious();
    expect(label()).toHaveTextContent('September 2026');
    press(screen.getByText('This month'));
    expect(label()).toHaveTextContent('November 2026');
    expect(screen.queryByText('This month')).toBeNull();
  });
});

describe('monthSwitcher lifecycle', () => {
  it('updates the current month when the app returns after month end', () => {
    jest.setSystemTime(lastMinuteOfNovember);
    render(<HomeScreen />);
    expect(screen.getByLabelText('Next month')).toBeDisabled();
    jest.setSystemTime(firstMinuteOfDecember);
    emitAppState('background');
    expect(screen.getByLabelText('Next month')).toBeDisabled();
    emitAppState('active');
    expect(label()).toHaveTextContent('November 2026');
    expect(screen.getByLabelText('Next month')).toBeEnabled();
    expect(screen.getByText('This month')).toBeOnTheScreen();
    pressNext();
    expect(label()).toHaveTextContent('December 2026');
    expect(screen.getByLabelText('Next month')).toBeDisabled();
  });

  it('jumps to the new current month after month end', () => {
    jest.setSystemTime(lastMinuteOfNovember);
    render(<HomeScreen />);
    pressPrevious();
    jest.setSystemTime(firstMinuteOfDecember);
    press(screen.getByText('This month'));
    expect(label()).toHaveTextContent('December 2026');
  });

  it('keeps the selected month when the book changes', () => {
    render(<HomeScreen />);
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
    const { unmount } = render(<HomeScreen />);
    pressPrevious();
    expect(label()).toHaveTextContent('October 2026');
    unmount();
    render(<HomeScreen />);
    expect(label()).toHaveTextContent('November 2026');
  });

  it('gives the arrows 44 by 44 touch targets', () => {
    render(<HomeScreen />);
    pressPrevious();
    [screen.getByLabelText('Previous month'), screen.getByLabelText('Next month')].forEach((button) => {
      expect(button.props.accessibilityRole).toBe('button');
      expect(button.props.className).toContain('min-h-[44px]');
      expect(button.props.className).toContain('min-w-[44px]');
    });
    expect(screen.getByTestId('month-switcher-this-month').props.className).toContain('min-h-[44px]');
  });
});
