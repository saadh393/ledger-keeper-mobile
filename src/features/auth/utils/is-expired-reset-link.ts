export function isExpiredResetLink(params: { token?: string | string[]; error?: string | string[] }): boolean {
  return Boolean(params.error) || typeof params.token !== 'string' || params.token.length === 0;
}
