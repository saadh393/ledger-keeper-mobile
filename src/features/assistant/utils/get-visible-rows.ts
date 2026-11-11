export const COLLAPSED_ROW_LIMIT = 10;

export function getVisibleRows<T>(rows: T[], showAll: boolean): T[] {
  return showAll ? rows : rows.slice(0, COLLAPSED_ROW_LIMIT);
}
