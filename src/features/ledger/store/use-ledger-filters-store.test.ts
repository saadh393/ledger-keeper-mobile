import { act } from '@testing-library/react-native';
import { useLedgerFiltersStore } from '@/features/ledger/store/use-ledger-filters-store';

describe('useLedgerFiltersStore', () => {
  afterEach(() => act(() => useLedgerFiltersStore.setState({ query: '', kind: 'all', sort: 'newest' })));

  it('starts with no search, All and Newest first, and is not persisted', () => {
    expect(useLedgerFiltersStore.getState()).toEqual(expect.objectContaining({ query: '', kind: 'all', sort: 'newest' }));
    expect('persist' in useLedgerFiltersStore).toBe(false);
  });

  it('clears search and filter but keeps the sort', () => {
    act(() => {
      useLedgerFiltersStore.getState().setQuery('lunch');
      useLedgerFiltersStore.getState().setKind('income');
      useLedgerFiltersStore.getState().setSort('highest');
    });

    act(() => useLedgerFiltersStore.getState().clearFilters());

    expect(useLedgerFiltersStore.getState()).toEqual(expect.objectContaining({ query: '', kind: 'all', sort: 'highest' }));
  });
});
