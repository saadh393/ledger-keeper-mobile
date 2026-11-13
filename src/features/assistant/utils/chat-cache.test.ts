import { getSelectedConversationId } from '@/features/assistant/utils/get-selected-conversation-id';
import { getVisibleRows } from '@/features/assistant/utils/get-visible-rows';
import { prependMessages } from '@/features/assistant/utils/prepend-messages';
import { removeBookChat } from '@/features/assistant/utils/remove-book-chat';

const msg = (id: string) => ({ id, role: 'ai' as const, text: id, createdAt: '2026-11-11T06:00:00.000Z' });
const chat = (id: string) => ({ id, title: id, createdAt: '2026-11-11T06:00:00.000Z', updatedAt: '2026-11-11T06:00:00.000Z' });

describe('chat cache helpers', () => {
  it('prepends earlier messages and takes the new hasMore', () => {
    const conversation = { id: 'c', bookId: 'b', title: 't', currency: 'BDT', messages: [msg('3')], hasMore: true };
    const next = prependMessages(conversation, { messages: [msg('1'), msg('2')], hasMore: false });
    expect(next.messages.map(m => m.id)).toEqual(['1', '2', '3']);
    expect(next.hasMore).toBe(false);
  });

  it('removes a deleted chat from every page', () => {
    const data = { pageParams: [null, 'x'], pages: [{ items: [chat('a'), chat('b')], nextCursor: 'x' }, { items: [chat('c')], nextCursor: null }] };
    expect(removeBookChat(data, 'b').pages.map(page => page.items.map(item => item.id))).toEqual([['a'], ['c']]);
  });

  it('opens the selected chat only for its own book', () => {
    expect(getSelectedConversationId({ bookId: 'b1', conversationId: 'c1' }, 'b1')).toBe('c1');
    expect(getSelectedConversationId({ bookId: 'b1', conversationId: 'c1' }, 'b2')).toBeUndefined();
    expect(getSelectedConversationId(null, 'b1')).toBeUndefined();
  });

  it('shows the first 10 rows of a 25-row list until expanded', () => {
    const rows = Array.from({ length: 25 }, (_, index) => index);
    expect(getVisibleRows(rows, false)).toHaveLength(10);
    expect(getVisibleRows(rows, true)).toHaveLength(25);
  });
});
