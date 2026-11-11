import * as React from 'react';
import { View } from 'react-native';

export function AssistantMessagePlaceholder({ isUser }: { isUser: boolean }) {
  return (
    <View className={`gap-2 px-4 py-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
      {isUser
        ? <View className="h-10 w-1/2 rounded-3xl rounded-tr bg-paper-200" />
        : (
            <>
              <View className="h-4 w-4/5 rounded-md bg-border" />
              <View className="h-4 w-3/5 rounded-md bg-border" />
            </>
          )}
    </View>
  );
}
