import type { InstallmentSheet } from '@/features/installments/types';
import * as React from 'react';
import { InstallmentDeleteSheet } from '@/features/installments/components/installment-delete-sheet';
import { InstallmentFormSheet } from '@/features/installments/components/installment-form-sheet';
import { InstallmentPaymentSheet } from '@/features/installments/components/installment-payment-sheet';
import { InstallmentUndoSheet } from '@/features/installments/components/installment-undo-sheet';

export type InstallmentSheetsProps = {
  bookId: string;
  sheet: InstallmentSheet;
  currency: string;
  onDismiss: () => void;
};

export function InstallmentSheets({ bookId, sheet, currency, onDismiss }: InstallmentSheetsProps) {
  switch (sheet.kind) {
    case 'add':
      return <InstallmentFormSheet bookId={bookId} currency={currency} onDismiss={onDismiss} />;
    case 'edit':
      return <InstallmentFormSheet bookId={bookId} currency={currency} installment={sheet.installment} onDismiss={onDismiss} />;
    case 'pay':
      return <InstallmentPaymentSheet bookId={bookId} installment={sheet.installment} onDismiss={onDismiss} />;
    case 'delete':
      return <InstallmentDeleteSheet bookId={bookId} installment={sheet.installment} onDismiss={onDismiss} />;
    case 'undo':
      return <InstallmentUndoSheet bookId={bookId} installment={sheet.installment} payment={sheet.payment} onDismiss={onDismiss} />;
  }
}
