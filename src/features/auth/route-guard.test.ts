import { decideRoute, getRouteDecision } from '@/features/auth/route-guard';

describe('routeGuard pure functions', () => {
  describe('decideRoute(status)', () => {
    it('returns "splash" when status is "idle"', () => {
      expect(decideRoute('idle')).toBe('splash');
    });

    it('returns "home" when status is "signedIn"', () => {
      expect(decideRoute('signedIn')).toBe('home');
    });

    it('returns "auth" when status is "signedOut"', () => {
      expect(decideRoute('signedOut')).toBe('auth');
    });
  });

  describe('getRouteDecision(status, group)', () => {
    describe('in "(app)" group', () => {
      it('blocks render and does not redirect when auth is "idle" (keeping splash)', () => {
        const decision = getRouteDecision('idle', '(app)');
        expect(decision).toEqual({
          targetScreen: 'splash',
          redirect: null,
          canRender: false,
        });
      });

      it('permits render with no redirect when user is "signedIn"', () => {
        const decision = getRouteDecision('signedIn', '(app)');
        expect(decision).toEqual({
          targetScreen: 'home',
          redirect: null,
          canRender: true,
        });
      });

      it('redirects to "/auth" and blocks render when user is "signedOut"', () => {
        const decision = getRouteDecision('signedOut', '(app)');
        expect(decision).toEqual({
          targetScreen: 'auth',
          redirect: '/auth',
          canRender: false,
        });
      });
    });

    describe('in "(auth)" group', () => {
      it('blocks render and does not redirect when auth is "idle" (keeping splash)', () => {
        const decision = getRouteDecision('idle', '(auth)');
        expect(decision).toEqual({
          targetScreen: 'splash',
          redirect: null,
          canRender: false,
        });
      });

      it('redirects to "/" and blocks render when user is "signedIn"', () => {
        const decision = getRouteDecision('signedIn', '(auth)');
        expect(decision).toEqual({
          targetScreen: 'home',
          redirect: '/',
          canRender: false,
        });
      });

      it('permits render with no redirect when user is "signedOut"', () => {
        const decision = getRouteDecision('signedOut', '(auth)');
        expect(decision).toEqual({
          targetScreen: 'auth',
          redirect: null,
          canRender: true,
        });
      });
    });

    describe('in root context', () => {
      it('blocks render when idle', () => {
        const decision = getRouteDecision('idle', 'root');
        expect(decision).toEqual({
          targetScreen: 'splash',
          redirect: null,
          canRender: false,
        });
      });

      it('redirects to "/" when signedIn', () => {
        const decision = getRouteDecision('signedIn', 'root');
        expect(decision).toEqual({
          targetScreen: 'home',
          redirect: '/',
          canRender: true,
        });
      });

      it('redirects to "/auth" when signedOut', () => {
        const decision = getRouteDecision('signedOut', 'root');
        expect(decision).toEqual({
          targetScreen: 'auth',
          redirect: '/auth',
          canRender: true,
        });
      });
    });
  });
});
