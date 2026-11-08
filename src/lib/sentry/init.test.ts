jest.mock('@sentry/react-native', () => ({
  init: jest.fn(),
  wrap: jest.fn(comp => comp),
  setUser: jest.fn(),
  reactNavigationIntegration: jest.fn(() => ({
    name: 'ReactNavigation',
    registerNavigationContainer: jest.fn(),
  })),
}));

describe('sentry init', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('disables Sentry in development environment', () => {
    jest.doMock('@env', () => ({
      __esModule: true,
      default: {
        EXPO_PUBLIC_APP_ENV: 'development',
        EXPO_PUBLIC_SENTRY_DSN: 'https://examplePublicKey@o0.ingest.sentry.io/0',
        EXPO_PUBLIC_PACKAGE: 'com.ledgerkeeper.app.development',
        EXPO_PUBLIC_VERSION: '0.0.1',
      },
    }));

    const Sentry = require('@sentry/react-native');
    const { initSentry } = require('@/lib/sentry');
    initSentry();

    expect(Sentry.init).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: false,
        environment: 'development',
        release: 'com.ledgerkeeper.app.development@0.0.1',
      }),
    );
  });

  it('disables Sentry when DSN is missing even in preview', () => {
    jest.doMock('@env', () => ({
      __esModule: true,
      default: {
        EXPO_PUBLIC_APP_ENV: 'preview',
        EXPO_PUBLIC_SENTRY_DSN: undefined,
        EXPO_PUBLIC_PACKAGE: 'com.ledgerkeeper.app.preview',
        EXPO_PUBLIC_VERSION: '0.0.1',
      },
    }));

    const Sentry = require('@sentry/react-native');
    const { initSentry } = require('@/lib/sentry');
    initSentry();

    expect(Sentry.init).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: false,
        dsn: undefined,
        environment: 'preview',
      }),
    );
  });

  it('enables Sentry in preview with DSN, environment, and release tags', () => {
    jest.doMock('@env', () => ({
      __esModule: true,
      default: {
        EXPO_PUBLIC_APP_ENV: 'preview',
        EXPO_PUBLIC_SENTRY_DSN: 'https://examplePublicKey@o0.ingest.sentry.io/12345',
        EXPO_PUBLIC_PACKAGE: 'com.ledgerkeeper.app.preview',
        EXPO_PUBLIC_VERSION: '1.2.3',
      },
    }));

    const Sentry = require('@sentry/react-native');
    const { initSentry } = require('@/lib/sentry');
    initSentry();

    expect(Sentry.init).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: true,
        dsn: 'https://examplePublicKey@o0.ingest.sentry.io/12345',
        environment: 'preview',
        release: 'com.ledgerkeeper.app.preview@1.2.3',
        beforeSend: expect.any(Function),
        beforeBreadcrumb: expect.any(Function),
      }),
    );
  });

  it('enables Sentry in production with DSN and release', () => {
    jest.doMock('@env', () => ({
      __esModule: true,
      default: {
        EXPO_PUBLIC_APP_ENV: 'production',
        EXPO_PUBLIC_SENTRY_DSN: 'https://examplePublicKey@o0.ingest.sentry.io/12345',
        EXPO_PUBLIC_PACKAGE: 'com.ledgerkeeper.app',
        EXPO_PUBLIC_VERSION: '1.0.0',
      },
    }));

    const Sentry = require('@sentry/react-native');
    const { initSentry } = require('@/lib/sentry');
    initSentry();

    expect(Sentry.init).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: true,
        environment: 'production',
        release: 'com.ledgerkeeper.app@1.0.0',
      }),
    );
  });
});

describe('sentry setUserContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sets only user id and clears on null or empty', () => {
    const Sentry = require('@sentry/react-native');
    const { setUserContext } = require('@/lib/sentry');

    setUserContext('usr_xyz_123');
    expect(Sentry.setUser).toHaveBeenCalledWith({ id: 'usr_xyz_123' });

    setUserContext(null);
    expect(Sentry.setUser).toHaveBeenCalledWith(null);

    setUserContext('');
    expect(Sentry.setUser).toHaveBeenCalledWith(null);
  });
});
