import { HomeScreen } from '@/features/home/home-screen';
import i18n from '@/lib/i18n';
import { act, render, screen } from '@/lib/test-utils';

afterEach(async () => {
  await act(() => i18n.changeLanguage('en'));
});

describe('homeScreen', () => {
  it('shows the app name', () => {
    render(<HomeScreen />);
    expect(screen.getByText('Ledger Keeper')).toBeOnTheScreen();
  });

  it('shows the app name in Bangla', async () => {
    await act(() => i18n.changeLanguage('bn'));
    render(<HomeScreen />);
    expect(screen.getByText('লেজার কিপার')).toBeOnTheScreen();
  });
});
