import { toLocaleDigits } from '@/lib/format/locale-digits';

describe('toLocaleDigits', () => {
  it('maps Latin digits to Bengali digits in Bangla', () => {
    expect(toLocaleDigits('৳80,000', 'bn')).toBe('৳৮০,০০০');
    expect(toLocaleDigits('11 নভে. 2026', 'bn')).toBe('১১ নভে. ২০২৬');
  });

  it('keeps Bengali digits unchanged', () => {
    expect(toLocaleDigits('৳৮০,০০০', 'bn')).toBe('৳৮০,০০০');
  });

  it('keeps Latin digits in English', () => {
    expect(toLocaleDigits('৳80,000', 'en')).toBe('৳80,000');
  });
});
