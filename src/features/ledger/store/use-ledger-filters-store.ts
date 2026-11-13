import type { LedgerFilters, LedgerKindFilter, LedgerSort } from '@/features/ledger/utils/filter-rows';
import { create } from 'zustand';

type LedgerFiltersState = LedgerFilters & {
  isSearchOpen: boolean;
  setQuery: (query: string) => void;
  setKind: (kind: LedgerKindFilter) => void;
  setSort: (sort: LedgerSort) => void;
  openSearch: () => void;
  closeSearch: () => void;
  clearFilters: () => void;
};

export const useLedgerFiltersStore = create<LedgerFiltersState>()(set => ({
  query: '',
  kind: 'all',
  sort: 'newest',
  isSearchOpen: false,
  setQuery: query => set({ query }),
  setKind: kind => set({ kind }),
  setSort: sort => set({ sort }),
  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false, query: '' }),
  clearFilters: () => set({ query: '', kind: 'all', isSearchOpen: false }),
}));
