import type { SendFailure } from '@/features/assistant/utils/send-retry';
import { create } from 'zustand';

export type PendingSend = {
  text: string;
  key: string;
  failure: SendFailure | null;
};

type AssistantState = {
  isOpen: boolean;
  draft: string;
  pending: PendingSend | null;
  open: () => void;
  close: () => void;
  setDraft: (draft: string) => void;
  setPending: (pending: PendingSend | null) => void;
};

export const useAssistantStore = create<AssistantState>()(set => ({
  isOpen: false,
  draft: '',
  pending: null,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  setDraft: draft => set({ draft }),
  setPending: pending => set({ pending }),
}));
