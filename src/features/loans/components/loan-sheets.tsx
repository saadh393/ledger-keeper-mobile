import type { LoanSheet } from '@/features/loans/types';
import * as React from 'react';
import { LoanDeleteSheet } from '@/features/loans/components/loan-delete-sheet';
import { LoanFormSheet } from '@/features/loans/components/loan-form-sheet';
import { RepaymentSheet } from '@/features/loans/components/repayment-sheet';
import { RepaymentUndoSheet } from '@/features/loans/components/repayment-undo-sheet';

export type LoanSheetsProps = {
  bookId: string;
  sheet: LoanSheet;
  currency: string;
  onDismiss: () => void;
};

export function LoanSheets({ bookId, sheet, currency, onDismiss }: LoanSheetsProps) {
  switch (sheet.kind) {
    case 'add':
      return <LoanFormSheet bookId={bookId} currency={currency} onDismiss={onDismiss} />;
    case 'edit':
      return <LoanFormSheet bookId={bookId} currency={currency} debt={sheet.debt} onDismiss={onDismiss} />;
    case 'repay':
      return <RepaymentSheet bookId={bookId} debt={sheet.debt} onDismiss={onDismiss} />;
    case 'delete':
      return <LoanDeleteSheet bookId={bookId} debt={sheet.debt} onDismiss={onDismiss} />;
    case 'undo':
      return <RepaymentUndoSheet bookId={bookId} debt={sheet.debt} repayment={sheet.repayment} onDismiss={onDismiss} />;
  }
}
