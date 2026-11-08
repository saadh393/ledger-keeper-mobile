const { View } = require('react-native');
const { Directions } = require('react-native-gesture-handler/src/Directions');
const mockModule = require('react-native-gesture-handler/src/mocks/mocks');
const { State } = require('react-native-gesture-handler/src/State');

function createChainedGesture() {
  const gesture: any = new Proxy(
    {},
    {
      get: (_target, prop) => {
        if (prop === 'then')
          return undefined;
        return jest.fn(() => gesture);
      },
    },
  );
  return gesture;
}

const Gesture = {
  Pan: createChainedGesture,
  Tap: createChainedGesture,
  Native: createChainedGesture,
  Fling: createChainedGesture,
  LongPress: createChainedGesture,
  Pinch: createChainedGesture,
  Rotation: createChainedGesture,
};

module.exports = {
  ...mockModule.default,
  ...mockModule,
  State,
  Directions,
  Gesture,
  GestureDetector: View,
  GestureHandlerRootView: View,
};
