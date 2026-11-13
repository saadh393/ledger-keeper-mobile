import * as React from 'react';
import { ArtifactRenderer } from '@/features/assistant/components/artifacts/artifact-renderer';
import { render, screen } from '@/lib/test-utils';

function Artifact({ type, data }: { type: string; data: unknown }) {
  return <ArtifactRenderer artifact={{ id: 'a1', type, data }} currency="BDT" />;
}

const trend = (values: number[]) => ({ values, labels: values.map((_, index) => `${index + 1} Nov`), average: 100, peak: Math.max(0, ...values), streakDays: 3 });

describe('chart artifacts', () => {
  it('renders a 30-day trend with stats', () => {
    const values = Array.from({ length: 30 }, (_, index) => index * 10);
    render(<Artifact type="trend" data={trend(values)} />);
    expect(screen.getByTestId('trend-chart')).toBeOnTheScreen();
    expect(screen.getByTestId('trend-artifact-peak')).toHaveTextContent(/290/);
    expect(screen.queryByTestId('trend-artifact-empty')).toBeNull();
  });

  it('says there was no spending when every value is zero', () => {
    render(<Artifact type="trend" data={trend([0, 0, 0])} />);
    expect(screen.getByTestId('trend-artifact-empty')).toHaveTextContent('No spending in this period');
  });

  it('rejects a trend whose labels do not match its values', () => {
    render(<Artifact type="trend" data={{ ...trend([1, 2]), labels: ['a'] }} />);
    expect(screen.getByTestId('artifact-unavailable')).toBeOnTheScreen();
  });

  it('renders a category donut sorted by amount', () => {
    render(<Artifact type="category" data={{ total: 400, items: [{ name: 'Rent', value: 100, color: '#111111' }, { name: 'Food', value: 300, color: '#222222' }] }} />);
    expect(screen.getByTestId('category-donut')).toBeOnTheScreen();
    expect(screen.getByTestId('category-artifact-row-0')).toHaveTextContent(/Food.*75%/);
    expect(screen.getByTestId('category-artifact-row-1')).toHaveTextContent(/Rent.*25%/);
  });

  it('renders one category at 100%', () => {
    render(<Artifact type="category" data={{ total: 300, items: [{ name: 'Food', value: 300, color: '#222222' }] }} />);
    expect(screen.getByTestId('category-artifact-row-0')).toHaveTextContent(/100%/);
  });

  it('shows no data for a zero total', () => {
    render(<Artifact type="category" data={{ total: 0, items: [] }} />);
    expect(screen.getByTestId('category-artifact-empty')).toHaveTextContent('No data for this period');
  });
});
