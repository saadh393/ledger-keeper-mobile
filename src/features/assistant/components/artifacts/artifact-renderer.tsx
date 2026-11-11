import type { MessageArtifact } from '@/features/assistant/schemas/conversation-schema';
import * as React from 'react';
import Animated, { useReducedMotion, withTiming } from 'react-native-reanimated';
import { artifactRegistry } from '@/features/assistant/components/artifacts/artifact-registry';
import { ArtifactUnavailableCard } from '@/features/assistant/components/artifacts/artifact-unavailable-card';

export type ArtifactRendererProps = {
  artifact: MessageArtifact;
  currency: string;
};

const enterMs = 200;

function riseIn() {
  'worklet';
  return {
    initialValues: { opacity: 0, transform: [{ translateY: 6 }] },
    animations: { opacity: withTiming(1, { duration: enterMs }), transform: [{ translateY: withTiming(0, { duration: enterMs }) }] },
  };
}

export function ArtifactRenderer({ artifact, currency }: ArtifactRendererProps) {
  const reducedMotion = useReducedMotion();

  return (
    <Animated.View entering={reducedMotion ? undefined : riseIn}>
      {artifactRegistry[artifact.type]?.(artifact.data, currency, artifact.id) ?? <ArtifactUnavailableCard />}
    </Animated.View>
  );
}
