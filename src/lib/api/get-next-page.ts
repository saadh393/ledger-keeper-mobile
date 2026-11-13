export type PageInfo = {
  page: number;
  pageSize: number;
  total: number;
};

export function getNextPage(lastPage: PageInfo): number | undefined {
  return lastPage.page * lastPage.pageSize < lastPage.total ? lastPage.page + 1 : undefined;
}
