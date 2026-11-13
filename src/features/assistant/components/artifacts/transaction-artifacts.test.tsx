import * as React from 'react';
import { ArtifactRenderer } from '@/features/assistant/components/artifacts/artifact-renderer';
import { fireEvent, render, screen } from '@/lib/test-utils';

jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn() }) }));

function Artifact({ type, data }: { type: string; data: unknown }) {
  return <ArtifactRenderer artifact={{ id: 'a1', type, data }} currency="BDT" />;
}

function row(id: string, patch: Record<string, unknown> = {}) {
  return { id, kind: 'expense', name: `Lunch ${id}`, subtitle: '', category: 'Food', dateIso: '2026-11-11T06:00:00.000Z', amount: 250, ...patch };
}

describe('transaction artifacts', () => {
  it('renders a saved transaction', () => {
    render(<Artifact type="transaction" data={row('t1')} />);
    expect(screen.getByTestId('transaction-artifact')).toHaveTextContent(/Lunch t1/);
    expect(screen.getByTestId('transaction-artifact')).toHaveTextContent(/250/);
  });

  it('renders a batch with a deleted row struck through', () => {
    render(<Artifact type="transaction-batch" data={{ rows: [row('t1'), row('t2', { deleted: true })], net: -250 }} />);
    expect(screen.getAllByTestId('transaction-batch-artifact-row')).toHaveLength(2);
    expect(screen.getByTestId('artifact-deleted-row')).toHaveTextContent(/Deleted/);
    expect(screen.getByTestId('artifact-deleted-row-amount').props.className).toContain('line-through');
  });

  it('collapses a 25-row list to 10 until Show all is pressed', () => {
    const rows = Array.from({ length: 25 }, (_, index) => row(`t${index}`));
    render(<Artifact type="transaction-list" data={{ rows }} />);
    expect(screen.getAllByTestId('transaction-list-artifact-row')).toHaveLength(10);
    fireEvent.press(screen.getByTestId('transaction-list-artifact-show-all'));
    expect(screen.getAllByTestId('transaction-list-artifact-row')).toHaveLength(25);
  });

  it('shows the empty list message', () => {
    render(<Artifact type="transaction-list" data={{ rows: [] }} />);
    expect(screen.getByTestId('transaction-list-artifact-empty')).toBeOnTheScreen();
  });

  it('renders summary, insight and status cards', () => {
    render(<Artifact type="summary" data={{ income: 50000, expense: 12000, net: 38000, incomeDelta: 0, expenseDelta: 0, periodIso: '2026-11' }} />);
    expect(screen.getByTestId('summary-artifact')).toHaveTextContent(/50,000/);
    screen.unmount();
    render(<Artifact type="insight" data={{ title: 'Food is up', body: 'You spent more on food.', progress: 0.4, periodLabel: 'November' }} />);
    expect(screen.getByTestId('insight-artifact')).toHaveTextContent(/Food is up/);
    screen.unmount();
    render(<Artifact type="status" data={{ tone: 'error', title: 'Could not answer', body: 'Try again.' }} />);
    expect(screen.getByTestId('status-artifact')).toHaveTextContent(/Could not answer/);
  });

  it.each([
    ['an unknown type', 'future-card', {}],
    ['an invalid payload', 'transaction', { id: 1 }],
  ])('shows the unavailable card for %s', (_, type, data) => {
    render(<Artifact type={type} data={data} />);
    expect(screen.getByTestId('artifact-unavailable')).toHaveTextContent(/This item can't be shown in this version/);
  });
});
