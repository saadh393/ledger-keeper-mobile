import type { ChatMessage } from '@/features/assistant/schemas/conversation-schema';
import { toDayKey } from '@/lib/format/day-key';

export type ThreadItem
  = | { type: 'day'; key: string; day: string }
    | { type: 'message'; key: string; message: ChatMessage };

export function groupMessagesByDay(messages: ChatMessage[]): ThreadItem[] {
  const items: ThreadItem[] = [];
  let currentDay = '';
  for (const message of messages) {
    const day = toDayKey(message.createdAt);
    if (day !== currentDay) {
      currentDay = day;
      items.push({ type: 'day', key: `day-${day}`, day });
    }
    items.push({ type: 'message', key: message.id, message });
  }
  return items;
}
