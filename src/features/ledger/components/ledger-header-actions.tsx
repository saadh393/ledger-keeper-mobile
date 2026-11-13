import * as React from 'react';
import { View } from 'react-native';
import { AssistantButton } from '@/features/assistant/components/assistant-button';
import { DetectedInboxButton } from '@/features/auto-capture/components/detected-inbox-button';
import { LedgerMoreButton } from '@/features/ledger/components/ledger-more-button';
import { LedgerSearchButton } from '@/features/ledger/components/ledger-search-button';

export function LedgerHeaderActions() {
  return (
    <View className="flex-row items-center">
      <DetectedInboxButton />
      <AssistantButton />
      <LedgerSearchButton />
      <LedgerMoreButton />
    </View>
  );
}
