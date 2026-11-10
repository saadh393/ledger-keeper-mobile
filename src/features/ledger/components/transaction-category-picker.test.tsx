import type { CategoryItem } from '@/features/categories/schemas/category-schema';
import MockAdapter from 'axios-mock-adapter';
import * as React from 'react';
import { TransactionCategoryPicker } from '@/features/ledger/components/transaction-category-picker';
import { apiClient } from '@/lib/api/client';
import { fireEvent, render, screen, waitFor } from '@/lib/test-utils';

const mockCategories: CategoryItem[] = [
  { id: '1', name: 'Food', color: '#ff0000', kind: 'expense', system: true },
  { id: '2', name: 'Rent', color: '#00ff00', kind: 'expense', system: false },
  { id: '3', name: 'Salary', color: '#0000ff', kind: 'income', system: true },
];

describe('transactionCategoryPicker', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
    mock.onGet('/categories').reply(200, mockCategories);
  });

  afterEach(() => {
    mock.restore();
  });

  it('filters categories by kind (expense)', async () => {
    const onSelect = jest.fn();
    const onBack = jest.fn();

    render(
      <TransactionCategoryPicker
        selected=""
        kind="expense"
        onSelect={onSelect}
        onBack={onBack}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Food')).toBeOnTheScreen();
      expect(screen.getByText('Rent')).toBeOnTheScreen();
    });

    expect(screen.queryByText('Salary')).toBeNull();

    fireEvent.press(screen.getByText('Food'));
    expect(onSelect).toHaveBeenCalledWith('Food');
  });

  it('filters categories by kind (income)', async () => {
    const onSelect = jest.fn();
    const onBack = jest.fn();

    render(
      <TransactionCategoryPicker
        selected=""
        kind="income"
        onSelect={onSelect}
        onBack={onBack}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Salary')).toBeOnTheScreen();
    });

    expect(screen.queryByText('Food')).toBeNull();
  });

  it('filters categories by search query', async () => {
    render(
      <TransactionCategoryPicker
        selected=""
        kind="expense"
        onSelect={jest.fn()}
        onBack={jest.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Food')).toBeOnTheScreen();
    });

    const searchInput = screen.getByTestId('transaction-category-picker-search');
    fireEvent.changeText(searchInput, 'ren');

    expect(screen.queryByText('Food')).toBeNull();
    expect(screen.getByText('Rent')).toBeOnTheScreen();
  });

  it('calls onBack when back button pressed', async () => {
    const onBack = jest.fn();
    render(
      <TransactionCategoryPicker
        selected=""
        kind="expense"
        onSelect={jest.fn()}
        onBack={onBack}
      />,
    );

    fireEvent.press(screen.getByTestId('transaction-category-picker-back'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
