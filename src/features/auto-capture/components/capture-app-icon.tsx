import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import * as React from 'react';
import { View } from 'react-native';
import { notificationCapture } from '@/features/auto-capture/native/notification-capture';

export type CaptureAppIconProps = {
  packageName: string;
  size?: number;
};

export function CaptureAppIcon({ packageName, size = 32 }: CaptureAppIconProps) {
  const icon = useQuery({
    queryKey: ['auto-capture', 'icon', packageName],
    queryFn: () => notificationCapture.getAppIcon(packageName),
    staleTime: Infinity,
  });

  return icon.data
    ? <Image source={{ uri: icon.data }} style={{ width: size, height: size, borderRadius: 8 }} accessibilityIgnoresInvertColors />
    : <View style={{ width: size, height: size }} className="rounded-lg bg-surface-container" />;
}
