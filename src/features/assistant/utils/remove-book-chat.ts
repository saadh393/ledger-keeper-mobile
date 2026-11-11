import type { InfiniteData } from '@tanstack/react-query';
import type { BookChatPage } from '@/features/assistant/schemas/conversation-schema';

export function removeBookChat(data: InfiniteData<BookChatPage>, chatId: string): InfiniteData<BookChatPage> {
  return { ...data, pages: data.pages.map(page => ({ ...page, items: page.items.filter(item => item.id !== chatId) })) };
}
