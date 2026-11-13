import type { LaunchableApp } from '@/features/auto-capture/native/notification-capture';
import * as React from 'react';
import { View } from 'react-native';
import { Checkbox } from '@/components/ui/checkbox';
import { CaptureAppIcon } from '@/features/auto-capture/components/capture-app-icon';

export type CaptureAppRowProps = {
  app: LaunchableApp;
  checked: boolean;
  onToggle: (packageName: string) => void;
};

export const CaptureAppRow = React.memo(({ app, checked, onToggle }: CaptureAppRowProps) => (
  <View className="min-h-[52px] flex-row items-center gap-3 px-4">
    <CaptureAppIcon packageName={app.packageName} />
    <Checkbox
      testID={`capture-app-${app.packageName}`}
      checked={checked}
      onChange={() => onToggle(app.packageName)}
      label={app.label}
      accessibilityLabel={app.label}
      className="min-h-[48px] flex-1"
    />
  </View>
));
