import { z } from 'zod';

export type AmountErrorMessages = {
  amountRequired: string;
  amountInvalid: string;
  amountPositive: string;
  amountTooLarge: string;
  amountDecimals: string;
};

const BANGLA_DIGITS_RANGE = /[\u09E6-\u09EF]/g;
const AMOUNT_CHARACTERS = /^[0-9.,\u09E6-\u09EF]+$/;
const MAX_AMOUNT = 999_999_999_999.99;

export function normalizeBanglaDigits(input: string): string {
  return input.replace(BANGLA_DIGITS_RANGE, digit => String(digit.charCodeAt(0) - 0x09E6));
}

export function parseAmount(input: string): number {
  const normalized = normalizeBanglaDigits(input).replace(/,/g, '').trim();
  const value = Number.parseFloat(normalized);
  return Number.isNaN(value) ? 0 : value;
}

function getAmountIssue(input: string, messages: AmountErrorMessages): string | null {
  const trimmed = input.trim();
  if (!AMOUNT_CHARACTERS.test(trimmed))
    return messages.amountInvalid;
  const normalized = normalizeBanglaDigits(trimmed).replace(/,/g, '');
  if ((normalized.match(/\./g) || []).length > 1)
    return messages.amountInvalid;
  const decimals = normalized.split('.')[1];
  if (decimals !== undefined && decimals.length > 2)
    return messages.amountDecimals;
  const value = Number.parseFloat(normalized);
  if (Number.isNaN(value))
    return messages.amountInvalid;
  if (value <= 0)
    return messages.amountPositive;
  if (value > MAX_AMOUNT)
    return messages.amountTooLarge;
  return null;
}

export function createAmountSchema(messages: AmountErrorMessages) {
  return z
    .string()
    .trim()
    .min(1, messages.amountRequired)
    .superRefine((value, ctx) => {
      const message = getAmountIssue(value, messages);
      if (message)
        ctx.addIssue({ code: 'custom', message });
    });
}
