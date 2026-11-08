import { Redirect, Stack } from 'expo-router';
import * as React from 'react';

import { getRouteDecision, useAuthStatus } from '@/features/auth';

export default function AppLayout() {
  const status = useAuthStatus();
  const decision = getRouteDecision(status, '(app)');

  if (!decision.canRender) {
    if (decision.redirect) {
      return <Redirect href={decision.redirect} />;
    }
    return null;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
