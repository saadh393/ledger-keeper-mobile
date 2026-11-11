import * as React from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useCSSVariable } from 'uniwind';
import { Text } from '@/components/ui';
import { donutSegments } from '@/features/assistant/utils/donut-segments';

export type CategoryDonutProps = {
  items: { name: string; value: number; color: string }[];
  totalLabel: string;
  totalValue: string;
};

const size = 132;
const stroke = 16;
const radius = (size - stroke) / 2;
const circumference = 2 * Math.PI * radius;
const center = size / 2;

export function CategoryDonut({ items, totalLabel, totalValue }: CategoryDonutProps) {
  const track = useCSSVariable('--color-paper-200');
  const segments = donutSegments(items.map(item => item.value), circumference);

  return (
    <View testID="category-donut" pointerEvents="none" className="items-center justify-center self-center" style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={center} cy={center} r={radius} stroke={String(track)} strokeWidth={stroke} fill="none" />
        {segments.map((segment, index) => (
          <Circle
            key={items[index].name}
            cx={center}
            cy={center}
            r={radius}
            stroke={items[index].color}
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={`${segment.length} ${circumference}`}
            strokeDashoffset={-segment.offset}
            rotation={-90}
            origin={`${center}, ${center}`}
          />
        ))}
      </Svg>
      <Text className="text-meta text-ink-500">{totalLabel}</Text>
      <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6} className="px-5 text-title font-semibold text-ink-900" style={{ fontVariant: ['tabular-nums'] }}>{totalValue}</Text>
    </View>
  );
}
