import type { ReceiptDraftArtifactData } from '@/features/receipts/schemas/receipt-artifact-schemas';
import { parseAmount } from '@/features/ledger/schemas/transaction-form-schema';

export const MAX_RECEIPT_ITEMS = 100;
const MAX_INSTALLMENTS = 600;

export type ReceiptItemValues = {
  key: string;
  title: string;
  category: string;
  amount: string;
  quantity: string;
};

export type ReceiptDraftValues = {
  merchant: string;
  dateIso: string;
  items: ReceiptItemValues[];
  emi: boolean;
  count: string;
  perInstallment: string;
  plan: string;
  paid: string;
};

export type ReceiptConfirmInput = {
  merchant: string | null;
  dateIso: string;
  total: number;
  items: Array<{ title: string; category: string; amount: number; quantity: number | null }>;
  installments: { count: number; amount: number } | null;
};

export type PayInstallmentInput = {
  plan: string;
  amount: number;
  dateIso: string;
};

const toCents = (amount: number) => Math.round(amount * 100);

function toText(value: number | null) {
  return value ? String(value) : '';
}

export function createReceiptItem(key: string): ReceiptItemValues {
  return { key, title: '', category: '', amount: '', quantity: '' };
}

export function toReceiptDraftValues(data: ReceiptDraftArtifactData): ReceiptDraftValues {
  return {
    merchant: data.merchant ?? '',
    dateIso: data.dateIso,
    items: data.items.map((item, index) => ({
      key: String(index),
      title: item.title,
      category: item.category ?? '',
      amount: toText(item.amount),
      quantity: toText(item.quantity),
    })),
    emi: Boolean(data.paidInInstallments),
    count: '',
    perInstallment: '',
    plan: data.plan ?? data.plans[0] ?? '',
    paid: toText(data.total),
  };
}

export function getReceiptTotals(items: ReceiptItemValues[], adjustment: number) {
  const subtotal = items.reduce((sum, item) => sum + toCents(parseAmount(item.amount)), 0);
  return { subtotal: subtotal / 100, total: (subtotal + toCents(adjustment)) / 100 };
}

export function isReceiptItemValid(item: ReceiptItemValues) {
  return Boolean(item.title.trim() && item.category.trim() && parseAmount(item.amount) > 0);
}

function toInstallments(values: ReceiptDraftValues) {
  const count = Number(values.count);
  const amount = parseAmount(values.perInstallment);
  return Number.isInteger(count) && count >= 1 && count <= MAX_INSTALLMENTS && amount > 0 ? { count, amount } : null;
}

export function toReceiptConfirmInput(values: ReceiptDraftValues, adjustment: number): ReceiptConfirmInput | null {
  const { items } = values;
  const { total } = getReceiptTotals(items, adjustment);
  const installments = values.emi ? toInstallments(values) : null;
  if (!items.length || items.length > MAX_RECEIPT_ITEMS || !items.every(isReceiptItemValid) || total <= 0 || (values.emi && !installments))
    return null;
  return {
    merchant: values.merchant.trim() || null,
    dateIso: new Date(values.dateIso).toISOString(),
    total,
    items: items.map(item => ({
      title: item.title.trim(),
      category: item.category.trim(),
      amount: parseAmount(item.amount),
      quantity: parseAmount(item.quantity) > 0 ? parseAmount(item.quantity) : null,
    })),
    installments,
  };
}

export function toPayInstallmentInput(values: ReceiptDraftValues): PayInstallmentInput | null {
  const amount = parseAmount(values.paid);
  if (!values.plan || !(amount > 0))
    return null;
  return { plan: values.plan, amount, dateIso: new Date(values.dateIso).toISOString() };
}
