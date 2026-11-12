import * as React from 'react';
import { View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { pushLevel } from '@/features/voice/utils/push-level';

const barCount = 28;

export function VoiceWaveform({ level }: { level: number }) {
  const reducedMotion = useReducedMotion();
  const [history, setHistory] = React.useState(() => ({ level, bars: pushLevel([], level, barCount) }));

  if (history.level !== level)
    setHistory({ level, bars: pushLevel(history.bars, level, barCount) });

  if (reducedMotion) {
    return (
      <View testID="voice-level" className="h-1.5 flex-1 overflow-hidden rounded-full bg-paper-200">
        <View className="h-full rounded-full bg-accent" style={{ width: `${Math.round(level * 100)}%` }} />
      </View>
    );
  }

  return (
    <View testID="voice-waveform" className="h-8 flex-1 flex-row items-center justify-end gap-0.5 overflow-hidden">
      {history.bars.map(bar => (
        <View key={bar.id} className="w-[3px] rounded-full bg-accent" style={{ height: 3 + bar.level * 25 }} />
      ))}
    </View>
  );
}
