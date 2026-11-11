import type { LayoutChangeEvent } from 'react-native';
import * as React from 'react';
import { View } from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import { useCSSVariable } from 'uniwind';
import { sampleIndices } from '@/features/assistant/utils/sample-indices';

export type TrendChartProps = {
  values: number[];
  labels: string[];
};

const barsHeight = 112;
const labelsHeight = 20;
const maxLabels = 7;
const gap = 2;

function labelPosition(index: number, count: number, slot: number) {
  if (count > 1 && index === 0) {
    return { x: 0, anchor: 'start' } as const;
  }
  if (count > 1 && index === count - 1) {
    return { x: count * slot, anchor: 'end' } as const;
  }
  return { x: index * slot + slot / 2, anchor: 'middle' } as const;
}

export function TrendChart({ values, labels }: TrendChartProps) {
  const [width, setWidth] = React.useState(0);
  const [link, ink500] = useCSSVariable(['--color-link', '--color-ink-500']);
  const max = Math.max(0, ...values);
  const shown = sampleIndices(labels.length, maxLabels);
  const slot = values.length ? width / values.length : 0;
  const onLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width);

  return (
    <View testID="trend-chart" pointerEvents="none" onLayout={onLayout} style={{ height: barsHeight + labelsHeight }}>
      {width > 0
        ? (
            <Svg width={width} height={barsHeight + labelsHeight}>
              {values.map((value, index) => {
                const height = max > 0 && value > 0 ? Math.max(4, (value / max) * barsHeight) : 2;
                return (
                  <Rect
                    key={labels[index]}
                    x={index * slot + gap / 2}
                    y={barsHeight - height}
                    width={Math.max(1, slot - gap)}
                    height={height}
                    rx={Math.min(3, (slot - gap) / 2)}
                    fill={String(link)}
                  />
                );
              })}
              {[...shown].map((index) => {
                const position = labelPosition(index, labels.length, slot);
                return (
                  <SvgText
                    key={labels[index]}
                    x={position.x}
                    y={barsHeight + labelsHeight - 4}
                    fontSize={11}
                    fill={String(ink500)}
                    textAnchor={position.anchor}
                  >
                    {labels[index]}
                  </SvgText>
                );
              })}
            </Svg>
          )
        : null}
    </View>
  );
}
