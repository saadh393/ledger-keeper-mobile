import type { ChatMessage } from '@/features/assistant/schemas/conversation-schema';
import * as React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui';
import { ArtifactRenderer } from '@/features/assistant/components/artifacts/artifact-renderer';

export function AssistantMessage({ message, currency = 'BDT' }: { message: ChatMessage; currency?: string }) {
  const isUser = message.role === 'user';

  return (
    <View testID={`assistant-message-${message.role}`} className={`gap-2 px-4 py-1.5 ${isUser ? 'items-end' : 'items-stretch'}`}>
      {message.text && isUser
        ? (
            <View className="max-w-[85%] rounded-3xl rounded-tr bg-paper-200 px-4 py-2.5">
              <Text selectable className="text-body text-ink-900">{message.text}</Text>
            </View>
          )
        : null}
      {message.text && !isUser ? <Text selectable className="text-body text-ink-900">{message.text}</Text> : null}
      {message.artifacts?.map(artifact => <ArtifactRenderer key={artifact.id} artifact={artifact} currency={currency} />)}
    </View>
  );
}
