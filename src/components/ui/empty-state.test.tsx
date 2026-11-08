import { AlertTriangle } from 'lucide-react-native';
import * as React from 'react';

import { cleanup, fireEvent, render, screen } from '@/lib/test-utils';

import { EmptyState } from './empty-state';

afterEach(() => {
  cleanup();
  jest.restoreAllMocks();
});

describe('emptyState variants', () => {
  it('renders default empty variant with info tone, one-line title, and body', () => {
    render(
      <EmptyState
        title="No transactions yet"
        body="Start tracking your cashflow by adding your first transaction."
        testID="empty-state"
      />,
    );
    expect(screen.getByTestId('empty-state')).toBeOnTheScreen();

    const title = screen.getByTestId('empty-state-title');
    expect(title.props.numberOfLines).toBe(1);
    expect(screen.getByText('No transactions yet')).toBeOnTheScreen();
    expect(
      screen.getByText('Start tracking your cashflow by adding your first transaction.'),
    ).toBeOnTheScreen();
  });

  it('renders error variant with expense tone and default "Retry" action', () => {
    const onRetry = jest.fn();
    render(
      <EmptyState
        variant="error"
        title="Failed to load ledger"
        body="Check your internet connection and try again."
        onRetry={onRetry}
      />,
    );
    const retryButton = screen.getByText('Retry');
    expect(retryButton).toBeOnTheScreen();
    fireEvent.press(retryButton);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('renders error variant without action when no retry callback is provided', () => {
    render(
      <EmptyState
        variant="error"
        title="Something went wrong"
        body="An unexpected error occurred."
      />,
    );
    expect(screen.queryByTestId('empty-state-action-container')).toBeNull();
    expect(screen.queryByText('Retry')).toBeNull();
  });
});

describe('emptyState actions and customization', () => {
  it('renders without an action button and shows NO empty button space', () => {
    render(
      <EmptyState
        title="Empty state without action"
        body="There is nothing to do here."
      />,
    );
    expect(screen.queryByTestId('empty-state-action-container')).toBeNull();
  });

  it('renders optional action button when action is provided for empty variant', () => {
    const onAdd = jest.fn();
    render(
      <EmptyState
        title="No accounts"
        body="Add an account to begin."
        action={{ label: 'Add account', onPress: onAdd }}
      />,
    );
    expect(screen.getByTestId('empty-state-action-container')).toBeOnTheScreen();
    const actionButton = screen.getByText('Add account');
    expect(actionButton).toBeOnTheScreen();
    fireEvent.press(actionButton);
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it('supports actionLabel and onAction props', () => {
    const onAction = jest.fn();
    render(
      <EmptyState
        title="No items"
        actionLabel="Create item"
        onAction={onAction}
      />,
    );
    const actionButton = screen.getByText('Create item');
    fireEvent.press(actionButton);
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('supports action loading state', () => {
    render(
      <EmptyState
        variant="error"
        title="Connection error"
        onRetry={jest.fn()}
        actionLoading
      />,
    );
    expect(screen.getByTestId('empty-state-action-container')).toBeOnTheScreen();
  });

  it('supports custom tone and custom icon override', () => {
    render(
      <EmptyState
        tone="warning"
        icon={AlertTriangle}
        title="Warning message"
        body="Please pay attention."
      />,
    );
    expect(screen.getByText('Warning message')).toBeOnTheScreen();
  });
});
