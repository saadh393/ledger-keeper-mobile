import type { Breadcrumb, ErrorEvent, Event, EventHint, Exception, Primitive } from '@sentry/core';

type RequestData = NonNullable<Event['request']>;

/**
 * Strips query string and fragment/hash from a URL, preserving only the
 * protocol, hostname, and path (or relative path).
 */
export function scrubUrl(url: string | undefined): string | undefined {
  if (!url || typeof url !== 'string') {
    return url;
  }
  return url.replace(/([?#]).*$/, '');
}

/**
 * Scrubs sensitive patterns from strings:
 * - Tokens (Bearer tokens, JWTs, key-value secrets/tokens)
 * - Emails
 * - Currency amounts (BDT ৳, Tk, $, €, £, ₹, Bengali numerals, amount keywords)
 * - Notification texts (SMS, banking, bKash, Nagad, OTPs)
 * - URL query parameters embedded in text
 */
export function scrubString(input: string | undefined): string | undefined {
  if (!input || typeof input !== 'string') {
    return input;
  }

  let text = input;

  // 1. Strip query strings from URLs embedded in text
  text = text.replace(/(https?:\/\/[^\s"'<>?#]+)\?[^\s"'<>]*/gi, '$1');

  // 2. Notification text patterns (bKash/Nagad/bank/SMS/OTP)
  text = text.replace(
    /(?:bKash|Nagad|Rocket|Upay|Bank|City\s*Bank|BRAC\s*Bank|EBL|A\/C|Account|Card)\s*[:\-]?\s*.*?(?:received|debited|credited|transferred|Cash\s*In|Cash\s*Out|TrxID|TxnID|fee|balance).*/gi,
    '[REDACTED_NOTIFICATION]',
  );
  text = text.replace(
    /(?:(?:^|[\r\n])\s*(?:You have received|Payment received|Payment of|Cash In|Cash Out|Money sent to|Money received)|(?:TrxID|TxnID)\s*[:#]?[A-Z0-9]|\bOTP\s*[:\s]?\d|\bverification code\s*(?:is)?\s*[:\s]?\d).*/gi,
    '[REDACTED_NOTIFICATION]',
  );
  text = text.replace(
    /(?:বিকাশ|নগদ|রকেট|একাউন্ট|অ্যাকাউন্ট).*?(?:জমা|উত্তোলন|পাঠানো|লেনদেন|টাকা|TrxID).*/gi,
    '[REDACTED_NOTIFICATION]',
  );

  // 3. Tokens and Authorization credentials
  // Bearer tokens
  text = text.replace(/Bearer\s+[\w\-.~+/]+=*/gi, 'Bearer [REDACTED_TOKEN]');
  // Standard JWT pattern (3 base64 segments)
  text = text.replace(/\b[\w-]{10,}\.[\w-]{10,}\.[\w-]{10,}\b/g, '[REDACTED_TOKEN]');
  // Key-value credentials (token=..., apiKey=..., password=...)
  text = text.replace(
    /\b(access_token|refresh_token|auth_token|token|apiKey|api_key|secret|password|passwd|auth)\s*[:=]\s*(['"]?)[\w\-.~+/]+(\2)/gi,
    '$1=[REDACTED_TOKEN]',
  );
  // Named token patterns (e.g. secret_token_123, token_xyz)
  text = text.replace(/\b(tok|token|secret)_\w+\b/gi, '[REDACTED_TOKEN]');

  // 4. Emails
  text = text.replace(/\b[\w.%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[REDACTED_EMAIL]');

  // 5. Currency Amounts
  // Currency symbol/code before number (e.g., ৳500, $1,250.00, Tk. 500, BDT 100)
  text = text.replace(
    /(?:[৳$€£₹¥]|BDT|Tk\.?|টাকা|USD|EUR|GBP|INR)\s*[\d,]+(?:\.\d+)?/gi,
    '[REDACTED_AMOUNT]',
  );
  // Number before currency symbol/code (e.g., 500৳, 100 BDT, 500 Tk)
  text = text.replace(
    /[\d,]+(?:\.\d+)?\s*(?:[৳$€£₹¥]|BDT|Tk\.?|টাকা|USD|EUR|GBP|INR)/gi,
    '[REDACTED_AMOUNT]',
  );
  // Bengali numerals with optional currency (e.g. ৫০০ টাকা, ৳ ৫০০)
  text = text.replace(
    /(\s)?(?:৳|টাকা)?\s*[০১২৩৪৫৬৭৮৯,]+(?:\.[০১২৩৪৫৬৭৮৯]+)?\s*(?:৳|টাকা)?/g,
    (match, leadingSpace) => {
      if (/[০১২৩৪৫৬৭৮৯]/.test(match)) {
        return `${leadingSpace ?? ''}[REDACTED_AMOUNT]`;
      }
      return match;
    },
  );
  // Amount / balance keywords with number (e.g. amount: 500, balance: 1200)
  text = text.replace(
    /\b(amount|balance|total|fee|paid|received|debited|credited|charge|price|transfer|cost|spent)\s*[:=]?\s*(?:(?:[৳$€£₹¥]|BDT|Tk\.?|টাকা|USD|EUR|GBP|INR)\s*)?[\d,]+(?:\.\d+)?\b/gi,
    '$1: [REDACTED_AMOUNT]',
  );

  return text;
}

/**
 * Deep recursive scrubber for arbitrary data structures (extra, contexts, data).
 * Drops authorization headers, query parameter objects, and request/response bodies.
 */
export function scrubDeep(value: unknown, parentKey?: string): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  // If the parent key represents notification text or raw SMS
  if (parentKey && /notification|sms_text|sms_body|raw_sms/i.test(parentKey)) {
    return '[REDACTED_NOTIFICATION]';
  }

  // If the parent key is an auth/cookie header or body payload
  if (parentKey && /^(authorization|cookie|set-cookie|x-auth-token)$/i.test(parentKey)) {
    return undefined;
  }

  if (parentKey && /^(body|request_body|response_body|requestData|responseData|payload)$/i.test(parentKey)) {
    return undefined;
  }

  if (parentKey && /^(query|params|query_string|queryString)$/i.test(parentKey)) {
    return undefined;
  }

  if (typeof value === 'string') {
    return scrubString(value);
  }

  if (Array.isArray(value)) {
    return value
      .map(item => scrubDeep(item, parentKey))
      .filter(item => item !== undefined);
  }

  if (typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (/^(authorization|cookie|set-cookie|x-auth-token)$/i.test(k)) {
        continue;
      }
      if (/^(body|request_body|response_body|requestData|responseData|payload)$/i.test(k)) {
        continue;
      }
      if (/^(query|params|query_string|queryString)$/i.test(k)) {
        continue;
      }
      const scrubbed = scrubDeep(v, k);
      if (scrubbed !== undefined) {
        result[k] = scrubbed;
      }
    }
    return result;
  }

  return value;
}

/**
 * Pure beforeBreadcrumb scrubber function:
 * - Drops console breadcrumbs (returns null)
 * - Scrubs HTTP breadcrumbs: removes bodies, query strings, and auth tokens,
 *   retaining only method, path/clean url, and status
 * - Recursively scrubs sensitive data from other breadcrumbs
 */
export function scrubBreadcrumb(breadcrumb: Breadcrumb): Breadcrumb | null {
  // 1. Drop console breadcrumbs
  if (breadcrumb.category === 'console' || breadcrumb.type === 'console') {
    return null;
  }

  const scrubbed: Breadcrumb = { ...breadcrumb };

  // 2. HTTP / Fetch / XHR breadcrumbs
  const isHttp
    = scrubbed.category === 'http'
      || scrubbed.category === 'fetch'
      || scrubbed.category === 'xhr'
      || scrubbed.type === 'http';

  if (isHttp) {
    const data = (scrubbed.data ?? {}) as Record<string, unknown>;
    const cleanData: Record<string, unknown> = {};

    if (data.url && typeof data.url === 'string') {
      cleanData.url = scrubUrl(data.url);
    }
    if (data.method) {
      cleanData.method = typeof data.method === 'string' ? data.method.toUpperCase() : data.method;
    }
    if (data.status_code !== undefined) {
      cleanData.status_code = data.status_code;
    }
    else if (data.status !== undefined) {
      cleanData.status = data.status;
    }
    if (data.reason && typeof data.reason === 'string') {
      cleanData.reason = scrubString(data.reason);
    }

    scrubbed.data = cleanData;
    if (scrubbed.message) {
      scrubbed.message = scrubString(scrubbed.message);
    }
    return scrubbed;
  }

  // 3. General breadcrumbs
  if (scrubbed.message) {
    scrubbed.message = scrubString(scrubbed.message);
  }
  if (scrubbed.data) {
    scrubbed.data = scrubDeep(scrubbed.data) as Record<string, unknown>;
  }

  return scrubbed;
}

/**
 * Pure beforeSend scrubber function:
 * - Preserves ONLY user.id in user context (removes email, name, ip, etc.)
 * - Scrubs request objects: drops query strings, cookies, bodies, authorization headers
 * - Drops console breadcrumbs and scrubs remaining breadcrumbs
 * - Redacts sensitive tokens, emails, financial amounts, and notification text from
 *   messages, exceptions, extra, contexts, and tags
 */
export function scrubEvent<T extends ErrorEvent | Event>(event: T, _hint?: EventHint): T | null {
  const scrubbed: T = { ...event };

  // 1. User context: keep ONLY user.id, never email or name
  if (scrubbed.user) {
    if (scrubbed.user.id !== undefined && scrubbed.user.id !== null && String(scrubbed.user.id).trim() !== '') {
      scrubbed.user = { id: String(scrubbed.user.id) };
    }
    else {
      delete scrubbed.user;
    }
  }

  // 2. Breadcrumbs
  if (Array.isArray(scrubbed.breadcrumbs)) {
    scrubbed.breadcrumbs = scrubbed.breadcrumbs
      .map(b => scrubBreadcrumb(b))
      .filter((b): b is Breadcrumb => b !== null);
  }

  // 3. Request
  if (scrubbed.request) {
    const rawReq = scrubbed.request as RequestData;
    const cleanReq: RequestData = {
      ...rawReq,
      url: scrubUrl(rawReq.url),
    };
    delete cleanReq.query_string;
    delete cleanReq.data;
    delete cleanReq.cookies;

    if (cleanReq.headers) {
      const cleanHeaders: Record<string, string> = {};
      for (const [k, v] of Object.entries(cleanReq.headers)) {
        if (/^(authorization|cookie|set-cookie|x-auth-token)$/i.test(k)) {
          continue;
        }
        if (/token|auth/i.test(k)) {
          continue;
        }
        cleanHeaders[k] = scrubString(typeof v === 'string' ? v : String(v)) ?? '';
      }
      cleanReq.headers = cleanHeaders;
    }

    scrubbed.request = cleanReq;
  }

  // 4. Exception values
  if (scrubbed.exception?.values) {
    scrubbed.exception = {
      ...scrubbed.exception,
      values: scrubbed.exception.values.map((exc) => {
        const cleanExc: Exception = {
          ...exc,
          value: exc.value ? scrubString(exc.value) : exc.value,
          type: exc.type ? scrubString(exc.type) : exc.type,
        };
        return cleanExc;
      }),
    };
  }

  // 5. Message
  if (scrubbed.message) {
    scrubbed.message = scrubString(scrubbed.message);
  }

  // 6. Extra
  if (scrubbed.extra) {
    scrubbed.extra = scrubDeep(scrubbed.extra) as Record<string, unknown>;
  }

  // 7. Contexts
  if (scrubbed.contexts) {
    scrubbed.contexts = scrubDeep(scrubbed.contexts) as Event['contexts'];
  }

  // 8. Tags
  if (scrubbed.tags) {
    const cleanTags: Record<string, Primitive> = {};
    for (const [k, v] of Object.entries(scrubbed.tags)) {
      if (/token|auth|password|secret/i.test(k)) {
        continue;
      }
      if (typeof v === 'string') {
        cleanTags[k] = scrubString(v) ?? '';
      }
      else {
        cleanTags[k] = v;
      }
    }
    scrubbed.tags = cleanTags;
  }

  return scrubbed;
}
