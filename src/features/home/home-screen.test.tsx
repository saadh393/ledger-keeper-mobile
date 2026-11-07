import { HomeScreen } from '@/features/home/home-screen';
import { render, screen } from '@/lib/test-utils';

describe('homeScreen', () => {
  it('shows the app name', () => {
    render(<HomeScreen />);
    expect(screen.getByText('Ledger Keeper')).toBeOnTheScreen();
  });
});
