import { groupMessagesByDay } from '@/features/assistant/utils/group-messages-by-day';

const at = (id: string, createdAt: string) => ({ id, role: 'user' as const, text: id, createdAt });

describe('groupMessagesByDay', () => {
  it('keeps order and adds a divider per Asia/Dhaka day', () => {
    const items = groupMessagesByDay([
      at('a', '2026-11-10T10:00:00.000Z'),
      at('b', '2026-11-10T17:30:00.000Z'),
      at('c', '2026-11-10T18:30:00.000Z'),
    ]);
    expect(items.map(item => item.key)).toEqual(['day-2026-11-10', 'a', 'b', 'day-2026-11-11', 'c']);
  });

  it('returns nothing for an empty chat', () => {
    expect(groupMessagesByDay([])).toEqual([]);
  });
});
