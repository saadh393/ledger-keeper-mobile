export function isDeleteConfirmation(text: string): boolean {
  return text.normalize('NFKC').trim().toUpperCase() === 'DELETE';
}
