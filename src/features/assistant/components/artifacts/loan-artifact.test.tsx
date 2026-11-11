import type { Installment } from '@/features/installments/schemas/installment-schema';
import type { Debt } from '@/features/loans/schemas/debt-schema';
import * as React from 'react';
import { ArtifactRenderer } from '@/features/assistant/components/artifacts/artifact-renderer';
import { fireEvent, render, screen } from '@/lib/test-utils';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));

function LoanArtifact({ type, data }: { type: string; data: unknown }) {
  return <ArtifactRenderer artifact={{ id: 'a1', type, data }} currency="BDT" />;
}

const debt: Debt = {
  id: 'd1',
  direction: 'lent',
  counterparty: 'Rahim',
  amount: 1000,
  repaid: 400,
  outstanding: 600,
  currency: 'BDT',
  note: null,
  dateIso: '2026-10-01T06:00:00.000Z',
  dueDateIso: '2026-10-15T06:00:00.000Z',
  status: 'open',
};

const plan: Installment = { id: 'i1', title: 'Phone EMI', category: 'Gadgets', amount: 2000, totalCount: 12, paidCount: 3, remainingAmount: 18000, currency: 'BDT', status: 'active' };

describe('loanArtifact', () => {
  beforeEach(() => mockPush.mockClear());

  it('renders an overdue debt with outstanding, original and repaid', () => {
    render(<LoanArtifact type="debt" data={debt} />);
    expect(screen.getByText('Lent to Rahim')).toBeOnTheScreen();
    expect(screen.getByTestId('debt-artifact-overdue')).toHaveTextContent('Overdue');
    expect(screen.getByTestId('debt-artifact')).toHaveTextContent(/৳600.*৳1,000.*৳400/);
    fireEvent.press(screen.getByTestId('debt-artifact-view'));
    expect(mockPush).toHaveBeenCalledWith('/loans');
  });

  it('reads a debt card as one summary line', () => {
    render(<LoanArtifact type="debt" data={{ ...debt, direction: 'borrowed', status: 'settled', outstanding: 0, repaid: 1000 }} />);
    expect(screen.getByTestId('debt-artifact-settled')).toHaveTextContent('Settled');
    expect(screen.queryByTestId('debt-artifact-overdue')).toBeNull();
    expect(screen.getByLabelText('Borrowed from Rahim, Settled, original ৳1,000')).toBeOnTheScreen();
  });

  it('collapses a 15-row debt list to 10 with Show all', () => {
    const rows = Array.from({ length: 15 }, (_, i) => ({ ...debt, id: `d${i}`, counterparty: `P${i}` }));
    render(<LoanArtifact type="debt-list" data={{ lent: 9000, borrowed: 500, currency: 'BDT', rows }} />);
    expect(screen.getByTestId('debt-list-artifact')).toHaveTextContent(/Owed to you৳9,000.*You owe৳500/);
    expect(screen.getAllByTestId('debt-list-artifact-row')).toHaveLength(10);
    fireEvent.press(screen.getByText('Show all 15'));
    expect(screen.getAllByTestId('debt-list-artifact-row')).toHaveLength(15);
    expect(screen.queryByText('Show all 15')).toBeNull();
  });

  it('renders an installment with progress and a completed one', () => {
    render(<LoanArtifact type="installment" data={plan} />);
    expect(screen.getByTestId('installment-summary-count')).toHaveTextContent('3 of 12 paid');
    expect(screen.getByTestId('installment-summary-remaining')).toHaveTextContent('৳18,000 remaining');
    fireEvent.press(screen.getByTestId('installment-artifact-view'));
    expect(mockPush).toHaveBeenCalledWith('/installments');
    screen.unmount();
    render(<LoanArtifact type="installment" data={{ ...plan, paidCount: 12, remainingAmount: 0, status: 'completed' }} />);
    expect(screen.getByTestId('installment-summary-completed')).toHaveTextContent('Completed');
  });

  it('collapses a 15-row installment list', () => {
    const rows = Array.from({ length: 15 }, (_, i) => ({ ...plan, id: `i${i}` }));
    render(<LoanArtifact type="installment-list" data={{ rows }} />);
    expect(screen.getAllByTestId('installment-list-artifact-row')).toHaveLength(10);
    expect(screen.getByText('Show all 15')).toBeOnTheScreen();
  });

  it('shows the fallback card for an invalid payload', () => {
    render(<LoanArtifact type="debt" data={{ id: 'broken' }} />);
    expect(screen.getByTestId('artifact-unavailable')).toHaveTextContent(/This item can't be shown in this version/);
  });
});
