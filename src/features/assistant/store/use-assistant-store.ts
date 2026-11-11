import { create } from 'zustand';

type AssistantState = {
  isOpen: boolean;
  draft: string;
  open: () => void;
  close: () => void;
  setDraft: (draft: string) => void;
};

export const useAssistantStore = create<AssistantState>()(set => ({
  isOpen: false,
  draft: '',
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  setDraft: draft => set({ draft }),
}));
