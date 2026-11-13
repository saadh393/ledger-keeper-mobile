/* eslint-disable react-refresh/only-export-components */
import { SafeAreaView as NativeSafeAreaView } from 'react-native-safe-area-context';
import Svg from 'react-native-svg';
import { withUniwind } from 'uniwind';

export * from './bottom-sheet';
export * from './button';
export * from './checkbox';
export * from './chip';
export * from './empty-state';
export * from './focus-aware-status-bar';
export * from './icons';
export * from './image';
export * from './input';
export * from './list';
export * from './logo';
export * from './progress-bar';
export * from './segmented-control';
export * from './select';
export * from './stat-tile';
export * from './text';
export * from './tone-tile';
export * from './utils';
export * from '@/components/ui/offline-banner';

// export base components from react-native
export {
  ActivityIndicator,
  Pressable,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';

// Apply withUniwind to add className support
export const SafeAreaView = withUniwind(NativeSafeAreaView);
export const StyledSvg = withUniwind(Svg);
