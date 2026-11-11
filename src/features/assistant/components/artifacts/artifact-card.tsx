import type { LucideIcon } from 'lucide-react-native';
import type { Tone } from '@/components/ui';
import * as React from 'react';
import { View } from 'react-native';
import { Text, ToneTile } from '@/components/ui';

export type ArtifactCardProps = {
  label?: string;
  icon?: LucideIcon;
  meta?: React.ReactNode;
  tone?: Tone;
  summary: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
  testID: string;
};

const toneBorders: Record<Tone, string> = {
  info: 'border-border',
  income: 'border-forest-100',
  expense: 'border-clay-100',
  warning: 'border-wheat-200',
};

const toneGlows: Record<Tone, string> = {
  info: 'bg-selected',
  income: 'bg-forest-100',
  expense: 'bg-clay-100',
  warning: 'bg-wheat-200',
};

export function ArtifactCard({ label, icon, meta, tone = 'info', summary, footer, children, testID }: ArtifactCardProps) {
  return (
    <View testID={testID} className={`overflow-hidden rounded-3xl border bg-surface-container ${toneBorders[tone]}`}>
      <View pointerEvents="none" className={`absolute -top-12 -right-12 size-32 rounded-full opacity-60 ${toneGlows[tone]}`} />
      <View accessible accessibilityLabel={summary} className="px-4 pt-3 pb-1">
        {label
          ? (
              <View className="flex-row items-center gap-2">
                {icon ? <ToneTile tone={tone} icon={icon} size="sm" iconSize={16} /> : null}
                <Text numberOfLines={1} className="min-w-0 flex-1 text-label text-ink-700">{label}</Text>
                {meta}
              </View>
            )
          : null}
        {children}
      </View>
      {footer ? <View className="flex-row flex-wrap items-center gap-2 px-2 pb-2">{footer}</View> : null}
    </View>
  );
}
