import { isDebtOverdue } from '@/features/loans/utils/is-debt-overdue';

describe('isDebtOverdue', () => {
  const today = '2026-11-10';

  it('is overdue when an open loan is past its due day in Dhaka', () => {
    expect(isDebtOverdue({ status: 'open', dueDateIso: '2026-11-09T12:00:00.000Z' }, today)).toBe(true);
  });

  it('is not overdue on the due day itself, judged in Dhaka time', () => {
    expect(isDebtOverdue({ status: 'open', dueDateIso: '2026-11-09T20:00:00.000Z' }, today)).toBe(false);
  });

  it('is not overdue without a due date or once settled', () => {
    expect(isDebtOverdue({ status: 'open', dueDateIso: null }, today)).toBe(false);
    expect(isDebtOverdue({ status: 'settled', dueDateIso: '2026-01-01T00:00:00.000Z' }, today)).toBe(false);
  });
});
