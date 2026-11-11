import type { Href } from 'expo-router';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { Button } from '@/components/ui';

export type ArtifactLinkProps = {
  label: string;
  href: Href;
  testID: string;
};

export function ArtifactLink({ label, href, testID }: ArtifactLinkProps) {
  const router = useRouter();
  return <Button testID={testID} variant="text" size="sm" fullWidth={false} label={label} onPress={() => router.push(href)} />;
}
