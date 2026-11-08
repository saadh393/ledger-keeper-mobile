import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from '@/components/ui';
import { useUserProfile } from '@/features/currency';

function getInitials(name?: string): string {
  if (!name)
    return '';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0)
    return '';
  if (parts.length === 1)
    return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function DrawerProfileFooter() {
  const { t } = useTranslation();
  const { data: profile, isLoading, isError } = useUserProfile();

  if (isLoading && !profile) {
    return (
      <View
        testID="drawer-profile-loading"
        accessibilityLabel={t('navigation.profileLoading')}
        accessibilityRole="progressbar"
        className="flex-row items-center gap-3 border-t border-border/40 px-4 py-3"
      >
        <View
          testID="drawer-profile-loading-avatar"
          className="size-10 rounded-full bg-paper-200"
        />
        <View className="flex-1 gap-2">
          <View className="h-3.5 w-24 rounded-full bg-paper-200" />
          <View className="h-3 w-36 rounded-full bg-paper-200" />
        </View>
      </View>
    );
  }

  if (isError || !profile) {
    return null;
  }

  return (
    <View
      testID="drawer-profile-footer"
      className="flex-row items-center gap-3 border-t border-border/40 px-4 py-3"
    >
      <View
        testID="drawer-profile-avatar"
        className="size-10 items-center justify-center rounded-full bg-paper-200"
      >
        <Text className="text-label font-semibold text-ink-700">
          {getInitials(profile.name)}
        </Text>
      </View>
      <View className="flex-1 justify-center">
        <Text
          numberOfLines={1}
          className="text-row-title font-medium text-ink-900"
          testID="drawer-profile-name"
        >
          {profile.name}
        </Text>
        <Text
          numberOfLines={1}
          className="text-meta text-ink-500"
          testID="drawer-profile-email"
        >
          {profile.email}
        </Text>
      </View>
    </View>
  );
}
