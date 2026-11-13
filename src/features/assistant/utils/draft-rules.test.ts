import { isDraftAmountMissing, toDraftConfirmInput } from '@/features/assistant/utils/draft-confirm-input';
import { findClarificationAnswer } from '@/features/assistant/utils/find-clarification-answer';
import { resolveDraftConflict } from '@/features/assistant/utils/resolve-draft-conflict';
import { ApiError } from '@/lib/api/errors';

const values = { kind: 'expense' as const, title: ' Lunch ', category: 'Food', amount: '250', dateIso: '2026-11-11T06:00:00.000Z' };

describe('draft save rules', () => {
  it('builds the confirm payload from complete values', () => {
    expect(toDraftConfirmInput(values)).toEqual({ kind: 'expense', title: 'Lunch', category: 'Food', amount: 250, dateIso: '2026-11-11T06:00:00.000Z' });
  });

  it('accepts Bangla digits in the amount', () => {
    expect(toDraftConfirmInput({ ...values, amount: '২৫০' })?.amount).toBe(250);
  });

  it.each([
    ['kind', { kind: null }],
    ['title', { title: '  ' }],
    ['category', { category: '' }],
    ['amount', { amount: '0' }],
  ])('blocks saving without a %s', (_, patch) => {
    expect(toDraftConfirmInput({ ...values, ...patch })).toBeNull();
  });

  it('flags a missing amount', () => {
    expect(isDraftAmountMissing({ ...values, amount: '' })).toBe(true);
    expect(isDraftAmountMissing(values)).toBe(false);
  });
});

describe('resolveDraftConflict', () => {
  const data = { status: 'draft' as const, title: 'Lunch' };

  it('resolves both 409s to the server state', () => {
    expect(resolveDraftConflict(new ApiError({ kind: 'conflict', code: 'draft_dismissed' }), data)).toEqual({ status: 'dismissed', title: 'Lunch' });
    expect(resolveDraftConflict(new ApiError({ kind: 'conflict', code: 'draft_saved' }), data)).toEqual({ status: 'saved', title: 'Lunch' });
  });

  it('ignores other errors', () => {
    expect(resolveDraftConflict(new ApiError({ kind: 'conflict', code: 'operation_failed' }), data)).toBeNull();
    expect(resolveDraftConflict(new ApiError({ kind: 'server' }), data)).toBeNull();
  });
});

describe('findClarificationAnswer', () => {
  const messages = [
    { id: '1', role: 'ai' as const, artifacts: [{ id: 'q', type: 'clarification', data: {} }], createdAt: '2026-11-11T06:00:00.000Z' },
    { id: '2', role: 'user' as const, text: '500', createdAt: '2026-11-11T06:01:00.000Z' },
  ];

  it('uses the next user message as the answer', () => {
    expect(findClarificationAnswer(messages, 'q')).toBe('500');
  });

  it('returns null while unanswered', () => {
    expect(findClarificationAnswer(messages.slice(0, 1), 'q')).toBeNull();
    expect(findClarificationAnswer(messages, 'missing')).toBeNull();
  });
});
