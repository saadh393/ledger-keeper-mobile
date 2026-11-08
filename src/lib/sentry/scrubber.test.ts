import type { Breadcrumb, Event } from '@sentry/core';

import {
  scrubBreadcrumb,
  scrubDeep,
  scrubEvent,
  scrubString,
  scrubUrl,
} from '@/lib/sentry/scrubber';

describe('scrubUrl', () => {
  it('strips query strings and hashes from URLs', () => {
    expect(scrubUrl('https://api.ledgerkeeper.com/api/books?token=secret&page=1#details'))
      .toBe('https://api.ledgerkeeper.com/api/books');
  });

  it('handles relative URLs with query parameters', () => {
    expect(scrubUrl('/api/books/123/transactions?sort=desc#top'))
      .toBe('/api/books/123/transactions');
  });

  it('leaves clean URLs unchanged', () => {
    expect(scrubUrl('https://api.ledgerkeeper.com/api/books'))
      .toBe('https://api.ledgerkeeper.com/api/books');
  });

  it('handles undefined or non-string input safely', () => {
    expect(scrubUrl(undefined)).toBeUndefined();
  });
});

describe('scrubString', () => {
  it('redacts emails', () => {
    expect(scrubString('Contact saad.hasan+work@example.com for help'))
      .toBe('Contact [REDACTED_EMAIL] for help');
  });

  it('redacts Bearer and JWT tokens', () => {
    const bearer = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    const scrubbed = scrubString(`Auth failed: ${bearer}`);
    expect(scrubbed).not.toContain('eyJhbGciOi');
    expect(scrubbed).toContain('[REDACTED_TOKEN]');
  });

  it('redacts key-value tokens and secrets', () => {
    expect(scrubString('Failed request with token=secret_token_12345 and apiKey=pk_live_99999'))
      .toBe('Failed request with token=[REDACTED_TOKEN] and apiKey=[REDACTED_TOKEN]');
  });

  it('redacts BDT amounts with ৳ and Tk', () => {
    expect(scrubString('Paid ৳ 500 for lunch and Tk. 1,250 for groceries'))
      .toBe('Paid [REDACTED_AMOUNT] for lunch and [REDACTED_AMOUNT] for groceries');
    expect(scrubString('Received 500.00 BDT from client'))
      .toBe('Received [REDACTED_AMOUNT] from client');
  });

  it('redacts international currency amounts ($ € £ ₹ ¥)', () => {
    expect(scrubString('Total was $99.99 and fee was €5.50'))
      .toBe('Total was [REDACTED_AMOUNT] and fee was [REDACTED_AMOUNT]');
  });

  it('redacts Bengali numerals and words', () => {
    expect(scrubString('খরচ হয়েছে ৫০০ টাকা'))
      .toBe('খরচ হয়েছে [REDACTED_AMOUNT]');
  });

  it('redacts amount keywords with numbers', () => {
    expect(scrubString('Transaction amount: 1500 and remaining balance: 3500'))
      .toBe('Transaction amount: [REDACTED_AMOUNT] and remaining balance: [REDACTED_AMOUNT]');
  });

  it('redacts notification text patterns', () => {
    expect(scrubString('You have received Tk 500 from 01712345678. Ref: dinner. TrxID 9A8B7C6D'))
      .toBe('[REDACTED_NOTIFICATION]');
    expect(scrubString('bKash: Cash In Tk 1,000 from 01800000000 successful. TrxID 8A9B'))
      .toBe('[REDACTED_NOTIFICATION]');
    expect(scrubString('A/C 1234567890 debited by BDT 2,500.00 at POS'))
      .toBe('[REDACTED_NOTIFICATION]');
  });

  it('strips query strings from embedded URLs in text', () => {
    expect(scrubString('Request failed for https://api.ledgerkeeper.com/books?token=secret123 at runtime'))
      .toBe('Request failed for https://api.ledgerkeeper.com/books at runtime');
  });
});

describe('scrubDeep', () => {
  it('removes authorization headers, bodies, and query params from nested objects', () => {
    const input = {
      safeField: 'hello',
      authorization: 'Bearer secret',
      cookie: 'session=123',
      request_body: { secret: 'data' },
      query: { token: '123' },
      nested: {
        payload: { token: 'xyz' },
        userEmail: 'user@example.com',
      },
    };

    const result = scrubDeep(input) as Record<string, unknown>;
    expect(result.safeField).toBe('hello');
    expect(result.authorization).toBeUndefined();
    expect(result.cookie).toBeUndefined();
    expect(result.request_body).toBeUndefined();
    expect(result.query).toBeUndefined();
    expect((result.nested as Record<string, unknown>).payload).toBeUndefined();
    expect((result.nested as Record<string, unknown>).userEmail).toBe('[REDACTED_EMAIL]');
  });

  it('redacts notification properties', () => {
    const input = {
      notification: 'Raw banking alert SMS',
      sms_text: 'OTP 123456',
    };
    const result = scrubDeep(input) as Record<string, unknown>;
    expect(result.notification).toBe('[REDACTED_NOTIFICATION]');
    expect(result.sms_text).toBe('[REDACTED_NOTIFICATION]');
  });
});

describe('scrubBreadcrumb', () => {
  it('drops console breadcrumbs completely', () => {
    const consoleBreadcrumb: Breadcrumb = {
      category: 'console',
      message: 'Sensitive console log with token 12345',
      level: 'info',
    };
    expect(scrubBreadcrumb(consoleBreadcrumb)).toBeNull();

    const consoleTypeBreadcrumb: Breadcrumb = {
      type: 'console',
      message: 'Console debug',
    };
    expect(scrubBreadcrumb(consoleTypeBreadcrumb)).toBeNull();
  });

  it('scrubs HTTP breadcrumb keeping only method, path, and status while stripping query and bodies', () => {
    const httpBreadcrumb: Breadcrumb = {
      category: 'http',
      type: 'http',
      data: {
        url: 'https://api.ledgerkeeper.com/api/books/123/transactions?sort=desc&token=supersecret#frag',
        method: 'post',
        status_code: 201,
        request_body: '{"amount": 500, "note": "secret"}',
        response_body: '{"id": "tx_99"}',
        headers: {
          Authorization: 'Bearer secret_tok',
        },
        params: { sort: 'desc' },
      },
    };

    const scrubbed = scrubBreadcrumb(httpBreadcrumb);
    expect(scrubbed).not.toBeNull();
    expect(scrubbed?.data?.url).toBe('https://api.ledgerkeeper.com/api/books/123/transactions');
    expect(scrubbed?.data?.method).toBe('POST');
    expect(scrubbed?.data?.status_code).toBe(201);
    expect(scrubbed?.data?.request_body).toBeUndefined();
    expect(scrubbed?.data?.response_body).toBeUndefined();
    expect(scrubbed?.data?.headers).toBeUndefined();
    expect(scrubbed?.data?.params).toBeUndefined();
  });

  it('scrubs sensitive patterns in non-HTTP breadcrumbs', () => {
    const breadcrumb: Breadcrumb = {
      category: 'ui.action',
      message: 'User clicked button for invoice payment of ৳ 500 by user@example.com',
      data: {
        note: 'Sent token=tok_abc to user',
      },
    };

    const scrubbed = scrubBreadcrumb(breadcrumb);
    expect(scrubbed?.message).toBe('User clicked button for invoice payment of [REDACTED_AMOUNT] by [REDACTED_EMAIL]');
    expect((scrubbed?.data as Record<string, unknown>)?.note).toBe('Sent token=[REDACTED_TOKEN] to user');
  });
});

describe('scrubEvent - User Context & Request Sanitization', () => {
  it('preserves only user.id in user context and removes email, name, ip', () => {
    const event: Event = {
      user: {
        id: 'usr_secure_999',
        email: 'ceo@company.com',
        username: 'ceouser',
        ip_address: '192.168.1.1',
      },
    };

    const scrubbed = scrubEvent(event);
    expect(scrubbed?.user).toEqual({ id: 'usr_secure_999' });
    expect(scrubbed?.user?.email).toBeUndefined();
    expect(scrubbed?.user?.username).toBeUndefined();
    expect(scrubbed?.user?.ip_address).toBeUndefined();
  });

  it('deletes user context completely when user id is missing', () => {
    const event: Event = {
      user: {
        email: 'orphan@company.com',
        username: 'orphan',
      },
    };

    const scrubbed = scrubEvent(event);
    expect(scrubbed?.user).toBeUndefined();
  });

  it('filters out console breadcrumbs and scrubs remaining breadcrumbs in event', () => {
    const event: Event = {
      breadcrumbs: [
        { category: 'console', message: 'console log message' },
        {
          category: 'http',
          data: {
            url: 'https://api.ledgerkeeper.com/api/transactions?token=secret123',
            method: 'get',
            status_code: 200,
            body: 'payload',
          },
        },
      ],
    };

    const scrubbed = scrubEvent(event);
    expect(scrubbed?.breadcrumbs).toHaveLength(1);
    expect(scrubbed?.breadcrumbs?.[0].category).toBe('http');
    expect(scrubbed?.breadcrumbs?.[0].data?.url).toBe('https://api.ledgerkeeper.com/api/transactions');
    expect(scrubbed?.breadcrumbs?.[0].data?.body).toBeUndefined();
  });

  it('scrubs event request: removes query strings, request bodies, cookies, and auth headers', () => {
    const event: Event = {
      request: {
        url: 'https://api.ledgerkeeper.com/api/auth/login?redirect=dashboard&token=secret_123',
        query_string: 'redirect=dashboard&token=secret_123',
        data: '{"password":"mypassword123"}',
        cookies: { session_cookie: 'abc' },
        headers: {
          'Authorization': 'Bearer super_jwt_token',
          'content-type': 'application/json',
          'x-auth-token': 'auth_tok_xyz',
        },
        method: 'POST',
      },
    };

    const scrubbed = scrubEvent(event);
    expect(scrubbed?.request?.url).toBe('https://api.ledgerkeeper.com/api/auth/login');
    expect(scrubbed?.request?.query_string).toBeUndefined();
    expect(scrubbed?.request?.data).toBeUndefined();
    expect(scrubbed?.request?.cookies).toBeUndefined();
    expect(scrubbed?.request?.headers?.Authorization).toBeUndefined();
    expect(scrubbed?.request?.headers?.['x-auth-token']).toBeUndefined();
    expect(scrubbed?.request?.headers?.['content-type']).toBe('application/json');
    expect(scrubbed?.request?.method).toBe('POST');
  });
});

describe('scrubEvent - Full Redaction Contract', () => {
  it('asserts that token, amount, notification text, and email DO NOT SURVIVE in any part of event', () => {
    const rawToken = 'secret_token_live_abc123456789';
    const rawJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    const rawEmail = 'financial.user@ledgerkeeper.com';
    const rawAmount1 = '৳ 15,500.50';
    const rawAmount2 = '$2,499.00';
    const rawAmount3 = '৫০০ টাকা';
    const rawNotification = 'You have received Tk 15,500.50 from 01712345678. Ref: project-payout. TrxID 9X8Y7Z6W';

    const event: Event = {
      message: `Failed transaction processing for ${rawEmail} with amount ${rawAmount1}`,
      exception: {
        values: [
          {
            type: 'FinancialError',
            value: `Error executing payment with token ${rawToken} and jwt ${rawJwt}`,
          },
        ],
      },
      breadcrumbs: [
        {
          category: 'sms',
          message: rawNotification,
        },
      ],
      extra: {
        notificationPayload: rawNotification,
        amountDue: rawAmount2,
        userEmail: rawEmail,
        bengaliAmount: rawAmount3,
        sessionToken: rawToken,
      },
      contexts: {
        payment: {
          chargeAmount: rawAmount1,
          customerEmail: rawEmail,
          authToken: rawToken,
        },
      },
      tags: {
        currency: 'BDT',
        userEmail: rawEmail,
      },
      user: {
        id: 'usr_valid_id',
        email: rawEmail,
        name: 'Saad Hasan',
      },
    };

    const scrubbed = scrubEvent(event);
    expect(scrubbed).not.toBeNull();

    const serialized = JSON.stringify(scrubbed);

    // Assert none survive:
    expect(serialized).not.toContain(rawToken);
    expect(serialized).not.toContain(rawJwt);
    expect(serialized).not.toContain(rawEmail);
    expect(serialized).not.toContain('15,500.50');
    expect(serialized).not.toContain('2,499.00');
    expect(serialized).not.toContain('৫০০');
    expect(serialized).not.toContain('01712345678');
    expect(serialized).not.toContain('project-payout');
    expect(serialized).not.toContain('9X8Y7Z6W');
    expect(serialized).not.toContain('Saad Hasan');

    // Confirm that required user id remains intact:
    expect(scrubbed?.user).toEqual({ id: 'usr_valid_id' });
  });

  it('acts as a pure function and does not mutate the original event', () => {
    const originalEvent: Event = {
      user: {
        id: 'usr_1',
        email: 'leak@example.com',
      },
      message: 'Cost was $50',
    };

    const copy = JSON.parse(JSON.stringify(originalEvent));
    scrubEvent(originalEvent);
    expect(originalEvent).toEqual(copy);
  });
});
