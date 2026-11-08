import type { AuthStatus } from '@/features/auth/use-auth-store';

export type AuthTargetScreen = 'splash' | 'home' | 'auth';

export type RouteDecision = {
  targetScreen: AuthTargetScreen;
  redirect: '/' | '/auth' | null;
  canRender: boolean;
};

/**
 * Pure function: maps auth status (idle | signedIn | signedOut) to target screen.
 */
export function decideRoute(status: AuthStatus): AuthTargetScreen {
  switch (status) {
    case 'idle':
      return 'splash';
    case 'signedIn':
      return 'home';
    case 'signedOut':
      return 'auth';
  }
}

/**
 * Pure function: calculates route redirect and render permission for a route group.
 * - In '(app)': idle renders nothing; signedOut redirects to '/auth'; signedIn renders app.
 * - In '(auth)': idle renders nothing; signedIn redirects to '/'; signedOut renders auth.
 * - Root/other: idle renders nothing; signedIn directs to '/'; signedOut directs to '/auth'.
 */
export function getRouteDecision(
  status: AuthStatus,
  currentGroup: '(app)' | '(auth)' | 'root' = 'root',
): RouteDecision {
  const targetScreen = decideRoute(status);

  if (status === 'idle') {
    return {
      targetScreen,
      redirect: null,
      canRender: false,
    };
  }

  if (currentGroup === '(app)') {
    return {
      targetScreen,
      redirect: status === 'signedOut' ? '/auth' : null,
      canRender: status === 'signedIn',
    };
  }

  if (currentGroup === '(auth)') {
    return {
      targetScreen,
      redirect: status === 'signedIn' ? '/' : null,
      canRender: status === 'signedOut',
    };
  }

  return {
    targetScreen,
    redirect: status === 'signedIn' ? '/' : '/auth',
    canRender: true,
  };
}
