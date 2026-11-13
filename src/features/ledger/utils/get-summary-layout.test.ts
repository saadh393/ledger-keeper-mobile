import { getSummaryLayout } from '@/features/ledger/utils/get-summary-layout';

describe('getSummaryLayout', () => {
  it('keeps one row at full size when every value fits', () => {
    expect(getSummaryLayout(328, ['৳80K', '৳20K', '+৳60K'], 1)).toEqual({ stacked: false, fontSize: 20 });
  });

  it('shrinks every value to the same size, driven by the longest one', () => {
    expect(getSummaryLayout(328, ['৳19,860', '৳80,000', '+৳123,456'], 1)).toEqual({ stacked: false, fontSize: 14 });
  });

  it('switches to one row per value when the longest cannot fit at the minimum size', () => {
    expect(getSummaryLayout(328, ['৳999,999,999,999.99', '৳1', '৳1'], 1)).toEqual({ stacked: true, fontSize: 17 });
  });

  it('always stacks at a larger system font size', () => {
    expect(getSummaryLayout(328, ['৳1', '৳1', '৳0'], 1.3).stacked).toBe(true);
  });

  it('never goes below the minimum size', () => {
    expect(getSummaryLayout(120, ['৳999,999,999,999', '৳1', '৳1'], 1).fontSize).toBe(12);
  });
});
