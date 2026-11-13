import type { Language } from '@/lib/i18n/resources';

const bengaliZero = 0x09E6;

export function toLocaleDigits(text: string, locale: Language) {
  if (locale !== 'bn')
    return text;
  return text.replace(/\d/g, digit => String.fromCharCode(bengaliZero + Number(digit)));
}
