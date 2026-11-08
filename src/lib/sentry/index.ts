import Env from '@env';
import * as Sentry from '@sentry/react-native';

import { scrubBreadcrumb, scrubEvent } from '@/lib/sentry/scrubber';

export const routingInstrumentation = Sentry.reactNavigationIntegration();

export function initSentry() {
  const isEnabled
    = Env.EXPO_PUBLIC_APP_ENV !== 'development'
      && Boolean(Env.EXPO_PUBLIC_SENTRY_DSN);

  Sentry.init({
    dsn: Env.EXPO_PUBLIC_SENTRY_DSN,
    enabled: isEnabled,
    environment: Env.EXPO_PUBLIC_APP_ENV,
    release: `${Env.EXPO_PUBLIC_PACKAGE}@${Env.EXPO_PUBLIC_VERSION}`,
    integrations: [routingInstrumentation],
    beforeSend: scrubEvent,
    beforeBreadcrumb: scrubBreadcrumb,
    tracesSampleRate: 1.0,
  });
}

/**
 * Set user context in Sentry.
 * Privacy rule: contains ONLY user id, never email or name.
 */
export function setUserContext(userId: string | null) {
  if (userId && String(userId).trim() !== '') {
    Sentry.setUser({ id: String(userId) });
  }
  else {
    Sentry.setUser(null);
  }
}

export { Sentry };
export { scrubBreadcrumb, scrubEvent } from '@/lib/sentry/scrubber';
export const wrap = Sentry.wrap;
