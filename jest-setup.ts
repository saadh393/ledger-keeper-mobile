/* eslint-disable ts/ban-ts-comment */
/* eslint-disable no-restricted-globals */

// Mock react-native-worklets first
jest.mock('react-native-worklets', () => ({
  __esModule: true,
  default: {},
}));

// Mock @dev-plugins/react-query
jest.mock('@dev-plugins/react-query', () => ({
  useReactQueryDevTools: jest.fn(),
}));

// Mock @react-native-community/netinfo
jest.mock('@react-native-community/netinfo', () =>
  require('@react-native-community/netinfo/jest/netinfo-mock.js'));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const View = require('react-native').View;

  return {
    __esModule: true,
    default: {
      View,
      ScrollView: View,
      createAnimatedComponent: (component: any) => component,
    },
    useSharedValue: jest.fn((init = 0) => ({ value: init })),
    useAnimatedStyle: jest.fn(fn => fn()),
    useReducedMotion: jest.fn(() => false),
    withTiming: jest.fn((value, _config, cb) => {
      cb?.(true);
      return value;
    }),
    withSpring: jest.fn(value => value),
    withDecay: jest.fn(value => value),
    withDelay: jest.fn((_, value) => value),
    withRepeat: jest.fn(value => value),
    withSequence: jest.fn((...values) => values[0]),
    cancelAnimation: jest.fn(),
    Easing: {
      linear: jest.fn(),
      ease: jest.fn(),
      quad: jest.fn(),
      cubic: jest.fn(),
      bezier: jest.fn(),
      in: jest.fn(fn => fn),
      out: jest.fn(fn => fn),
      inOut: jest.fn(fn => fn),
    },
    FadeIn: { duration: jest.fn(() => ({})) },
    FadeOut: { duration: jest.fn(() => ({})) },
    FadeInDown: { duration: jest.fn(() => ({})) },
    FadeInUp: { duration: jest.fn(() => ({})) },
    FadeInLeft: { duration: jest.fn(() => ({})) },
    FadeInRight: { duration: jest.fn(() => ({})) },
    SlideInDown: { duration: jest.fn(() => ({})) },
    SlideInUp: { duration: jest.fn(() => ({})) },
    SlideInLeft: { duration: jest.fn(() => ({})) },
    SlideInRight: { duration: jest.fn(() => ({})) },
    Layout: {},
    Keyframe: jest.fn(),
  };
});

// Mock expo-localization
jest.mock('expo-localization', () => ({
  getLocales: jest.fn(() => [
    {
      languageTag: 'en-US',
      languageCode: 'en',
      textDirection: 'ltr',
      digitGroupingSeparator: ',',
      decimalSeparator: '.',
      measurementSystem: 'metric',
      currencyCode: 'USD',
      currencySymbol: '$',
      regionCode: 'US',
    },
  ]),
}));

// Mock react-native-mmkv
jest.mock('react-native-mmkv', () => {
  const createMockInstance = () => {
    const deleteFn = jest.fn();
    return {
      set: jest.fn(),
      getString: jest.fn(),
      getNumber: jest.fn(),
      getBoolean: jest.fn(),
      delete: deleteFn,
      remove: deleteFn,
      clearAll: jest.fn(),
      getAllKeys: jest.fn(() => []),
    };
  };

  return {
    MMKV: jest.fn(() => createMockInstance()),
    useMMKVString: jest.fn((_key: string) => [undefined, jest.fn()]),
    useMMKVNumber: jest.fn((_key: string) => [undefined, jest.fn()]),
    useMMKVBoolean: jest.fn((_key: string) => [undefined, jest.fn()]),
    useMMKVObject: jest.fn((_key: string) => [undefined, jest.fn()]),
    createMMKV: jest.fn(() => createMockInstance()),
  };
});

require('@/lib/i18n');

// Global window object setup for React Native testing
// @ts-expect-error
global.window = {};

// @ts-expect-error
global.window = global;
