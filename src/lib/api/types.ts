export type ApiErrorKind
  = | 'offline'
    | 'timeout'
    | 'unauthorized'
    | 'insufficient_credits'
    | 'conflict'
    | 'validation'
    | 'forbidden'
    | 'not_found'
    | 'rate_limited'
    | 'server'
    | 'invalid_response';

export type ApiErrorOptions = {
  kind: ApiErrorKind;
  message?: string;
  status?: number;
  data?: unknown;
  code?: string;
  required?: number;
  available?: number;
  field?: string;
  limit?: number;
  issues?: unknown[];
  cause?: unknown;
};

export type UnauthorizedListener = () => void | Promise<void>;
