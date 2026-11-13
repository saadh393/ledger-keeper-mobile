import * as React from 'react';
import { ClarificationControl } from '@/features/assistant/components/artifacts/clarification-control';
import { fireEvent, render, screen } from '@/lib/test-utils';

const options = [{ label: 'Income', value: 'income' }, { label: 'Expense', value: 'expense' }];

describe('clarificationControl', () => {
  const onSubmit = jest.fn();
  beforeEach(() => onSubmit.mockClear());

  it('sends a typed or suggested amount', () => {
    render(<ClarificationControl control={{ type: 'amount', suggestions: [500] }} currency="BDT" onSubmit={onSubmit} disabled={false} />);
    fireEvent.changeText(screen.getByTestId('clarification-input'), '250');
    fireEvent.press(screen.getByTestId('clarification-send'));
    expect(onSubmit).toHaveBeenCalledWith('250');
    fireEvent.press(screen.getByTestId('clarification-option-500'));
    expect(onSubmit).toHaveBeenCalledWith('500');
  });

  it('sends text answers and suggestions', () => {
    render(<ClarificationControl control={{ type: 'text', suggestions: [{ label: 'Lunch', value: 'Lunch' }] }} currency="BDT" onSubmit={onSubmit} disabled={false} />);
    fireEvent.changeText(screen.getByTestId('clarification-input'), 'Dinner');
    fireEvent.press(screen.getByTestId('clarification-send'));
    expect(onSubmit).toHaveBeenCalledWith('Dinner');
    fireEvent.press(screen.getByTestId('clarification-option-Lunch'));
    expect(onSubmit).toHaveBeenCalledWith('Lunch');
  });

  it('sends the chosen toggle option', () => {
    render(<ClarificationControl control={{ type: 'toggle', options }} currency="BDT" onSubmit={onSubmit} disabled={false} />);
    fireEvent.press(screen.getByTestId('clarification-option-expense'));
    expect(onSubmit).toHaveBeenCalledWith('expense');
  });

  it('renders a select for select controls', () => {
    render(<ClarificationControl control={{ type: 'select', options }} currency="BDT" onSubmit={onSubmit} disabled={false} />);
    expect(screen.getByTestId('clarification-select-trigger')).toBeOnTheScreen();
  });

  it('does not send while disabled', () => {
    render(<ClarificationControl control={{ type: 'toggle', options }} currency="BDT" onSubmit={onSubmit} disabled />);
    fireEvent.press(screen.getByTestId('clarification-option-expense'));
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
