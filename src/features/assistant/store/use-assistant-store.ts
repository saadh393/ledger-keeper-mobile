import type { SendFailure } from '@/features/assistant/utils/send-retry';
import type { VoiceRecording } from '@/features/voice/utils/voice-recorder-reducer';
import { create } from 'zustand';

export type PendingSend = {
  text: string;
  key: string;
  failure: SendFailure | null;
  voice?: VoiceRecording;
};

export type ConversationSelection = {
  bookId: string;
  conversationId: string | null;
};

export type AssistantView = 'thread' | 'history';

type AssistantState = {
  isOpen: boolean;
  draft: string;
  pending: PendingSend | null;
  view: AssistantView;
  selection: ConversationSelection | null;
  open: () => void;
  close: () => void;
  setDraft: (draft: string) => void;
  setPending: (pending: PendingSend | null) => void;
  setView: (view: AssistantView) => void;
  select: (selection: ConversationSelection) => void;
};

export const useAssistantStore = create<AssistantState>()(set => ({
  isOpen: false,
  draft: '',
  pending: null,
  view: 'thread',
  selection: null,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false, view: 'thread', selection: null }),
  setDraft: draft => set({ draft }),
  setPending: pending => set({ pending }),
  setView: view => set({ view }),
  select: selection => set({ selection }),
}));
