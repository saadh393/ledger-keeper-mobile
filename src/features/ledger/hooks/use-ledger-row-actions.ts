import type { TransactionRow } from '@/features/ledger/schemas/book-table-schema';
import * as Haptics from 'expo-haptics';
import * as React from 'react';

export function useLedgerRowActions() {
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [menuRow, setMenuRow] = React.useState<TransactionRow | null>(null);
  const [deleteRow, setDeleteRow] = React.useState<TransactionRow | null>(null);

  const toggle = React.useCallback((row: TransactionRow) => {
    setExpandedId(id => (id === row.id ? null : row.id));
  }, []);

  const openMenu = React.useCallback((row: TransactionRow) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMenuRow(row);
  }, []);

  const closeMenu = React.useCallback(() => setMenuRow(null), []);
  const closeDelete = React.useCallback(() => setDeleteRow(null), []);

  return { expandedId, menuRow, deleteRow, toggle, openMenu, closeMenu, askDelete: setDeleteRow, closeDelete };
}
