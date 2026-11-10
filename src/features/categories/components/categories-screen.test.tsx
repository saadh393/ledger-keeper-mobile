/* eslint-disable max-lines-per-function */
import type { CategoryItem } from '@/features/categories/schemas/category-schema';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';
import * as React from 'react';
import { CategoriesScreen } from '@/features/categories/components/categories-screen';
import { TransactionCategoryPicker } from '@/features/ledger/components/transaction-category-picker';
import { apiClient } from '@/lib/api/client';
import { fireEvent, render, screen, waitFor, within } from '@/lib/test-utils';

const food: CategoryItem = { id: 'c-food', name: 'Food', color: '#4285F4', kind: 'expense', system: true };
const rent: CategoryItem = { id: 'c-rent', name: 'Rent', color: '#EA4335', kind: 'expense', system: false };
const salary: CategoryItem = { id: 'c-salary', name: 'Salary', color: '#34A853', kind: 'income', system: true };
const gifts: CategoryItem = { id: 'c-gifts', name: 'Gifts', color: '#FBBC04', kind: 'income', system: false };

describe('categoriesScreen', () => {
  let mockApi: MockAdapter;
  let queryClient: QueryClient;

  beforeEach(() => {
    mockApi = new MockAdapter(apiClient);
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false, networkMode: 'always' } },
    });
  });

  afterEach(() => {
    mockApi.restore();
    queryClient.clear();
  });

  function renderScreen(categories: CategoryItem[] = [food, rent, salary, gifts], picker = false) {
    mockApi.onGet('/categories').reply(200, categories);
    render(
      <QueryClientProvider client={queryClient}>
        <CategoriesScreen />
        {picker ? <TransactionCategoryPicker selected="" kind="expense" onSelect={jest.fn()} onBack={jest.fn()} /> : null}
      </QueryClientProvider>,
    );
  }

  function showExpense() {
    fireEvent.press(screen.getByTestId('categories-kind-segment-expense'));
  }

  async function openAdd() {
    fireEvent.press(await screen.findByTestId('categories-add'));
    return screen.findByTestId('category-form-name');
  }

  it('lists categories of the selected kind with their name', async () => {
    renderScreen();
    expect(await screen.findByText('Salary')).toBeOnTheScreen();
    expect(screen.getByText('Gifts')).toBeOnTheScreen();
    expect(screen.queryByText('Food')).toBeNull();

    showExpense();
    expect(screen.getByText('Food')).toBeOnTheScreen();
    expect(screen.getByText('Rent')).toBeOnTheScreen();
    expect(screen.queryByText('Salary')).toBeNull();
  });

  it('marks built-in categories and hides their delete action', async () => {
    renderScreen();
    expect(await screen.findByTestId('category-row-c-salary-built-in')).toHaveTextContent('Built-in');
    expect(screen.queryByTestId('category-row-c-salary-delete')).toBeNull();
    expect(screen.getByTestId('category-row-c-gifts-delete')).toBeOnTheScreen();
    expect(screen.queryByTestId('category-row-c-gifts-built-in')).toBeNull();
  });

  it('shows placeholders while loading', () => {
    mockApi.onGet('/categories').reply(() => new Promise(() => {}));
    render(
      <QueryClientProvider client={queryClient}>
        <CategoriesScreen />
      </QueryClientProvider>,
    );
    expect(screen.getByTestId('category-list-loading')).toBeOnTheScreen();
  });

  it('shows an error with Retry that refetches', async () => {
    mockApi.onGet('/categories').replyOnce(500).onGet('/categories').reply(200, [salary]);
    render(
      <QueryClientProvider client={queryClient}>
        <CategoriesScreen />
      </QueryClientProvider>,
    );
    expect(await screen.findByTestId('category-list-error')).toBeOnTheScreen();
    fireEvent.press(screen.getByText('Retry'));
    expect(await screen.findByText('Salary')).toBeOnTheScreen();
  });

  it('shows an empty state with Add category for a kind without categories', async () => {
    renderScreen([food]);
    expect(await screen.findByTestId('category-list-empty')).toBeOnTheScreen();
    expect(screen.getByText('No categories yet')).toBeOnTheScreen();
    fireEvent.press(within(screen.getByTestId('category-list-empty')).getByText('Add category'));
    expect(await screen.findByTestId('category-form-name')).toBeOnTheScreen();
  });

  it('preselects the current tab kind in the add sheet', async () => {
    renderScreen();
    await screen.findByText('Salary');
    showExpense();
    await openAdd();
    expect(screen.getByTestId('category-form-kind-segment-expense')).toBeSelected();
  });

  it('rejects a duplicate name for the kind and sends nothing', async () => {
    renderScreen();
    await screen.findByText('Salary');
    fireEvent.changeText(await openAdd(), ' salary ');
    fireEvent.press(screen.getByTestId('category-form-sheet-submit'));
    expect(await screen.findByText('You already have this category')).toBeOnTheScreen();
    expect(mockApi.history.post).toHaveLength(0);
  });

  it('adds a category once and shows it in the list and the transaction picker', async () => {
    let resolve!: () => void;
    const created: CategoryItem = { id: 'c-pets', name: 'Pets', color: '#7BAAF7', kind: 'expense', system: false };
    mockApi.onPost('/categories').reply(() => new Promise((r) => {
      resolve = () => r([201, created]);
    }));
    renderScreen([food, salary], true);
    await screen.findByText('Salary');
    showExpense();
    fireEvent.changeText(await openAdd(), '  Pets ');
    fireEvent.press(screen.getByTestId('category-form-sheet-submit'));
    fireEvent.press(screen.getByTestId('category-form-sheet-submit'));

    expect(await screen.findByText('Adding…')).toBeOnTheScreen();
    expect(mockApi.history.post).toHaveLength(1);
    expect(JSON.parse(mockApi.history.post[0].data)).toEqual({ name: 'Pets', kind: 'expense' });

    mockApi.onGet('/categories').reply(200, [food, salary, created]);
    resolve();
    expect(await screen.findByTestId('category-row-c-pets')).toBeOnTheScreen();
    expect(screen.getByTestId('category-item-Pets')).toBeOnTheScreen();
  });

  it('keeps the add sheet open with an error when offline', async () => {
    mockApi.onPost('/categories').networkError();
    renderScreen();
    await screen.findByText('Salary');
    fireEvent.changeText(await openAdd(), 'Bonus');
    fireEvent.press(screen.getByTestId('category-form-sheet-submit'));
    expect(await screen.findByTestId('category-form-sheet-error')).toHaveTextContent('You’re offline. Check your connection and try again.');
    expect(screen.getByTestId('category-form-name')).toHaveDisplayValue('Bonus');
  });

  it('confirms and deletes a user category from the list and the picker', async () => {
    mockApi.onDelete('/categories/c-rent').reply(200, { id: 'c-rent' });
    renderScreen(undefined, true);
    await screen.findByText('Salary');
    showExpense();
    expect(screen.getByTestId('category-item-Rent')).toBeOnTheScreen();

    fireEvent.press(screen.getByTestId('category-row-c-rent-delete'));
    expect(await screen.findByTestId('category-delete-sheet-body')).toHaveTextContent('Existing transactions keep this category name.');
    mockApi.onGet('/categories').reply(200, [food, salary, gifts]);
    fireEvent.press(screen.getByTestId('category-delete-sheet-confirm'));
    fireEvent.press(screen.getByTestId('category-delete-sheet-confirm'));

    await waitFor(() => expect(screen.queryByTestId('category-row-c-rent')).toBeNull());
    expect(screen.queryByTestId('category-item-Rent')).toBeNull();
    expect(mockApi.history.delete).toHaveLength(1);
  });

  it('keeps the row and shows an error when delete fails', async () => {
    mockApi.onDelete('/categories/c-rent').reply(500);
    renderScreen();
    await screen.findByText('Salary');
    showExpense();
    fireEvent.press(screen.getByTestId('category-row-c-rent-delete'));
    fireEvent.press(await screen.findByTestId('category-delete-sheet-confirm'));
    expect(await screen.findByTestId('category-delete-sheet-error')).toHaveTextContent('Something went wrong. Try again.');
    expect(screen.getByTestId('category-row-c-rent')).toBeOnTheScreen();
  });
});
