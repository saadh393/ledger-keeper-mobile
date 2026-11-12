import type { CropHandle, CropRect, Size } from '@/features/receipts/types';
import * as React from 'react';
import { View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import { useCropGesture } from '@/features/receipts/hooks/use-crop-gesture';

export type ReceiptCropHandleProps = {
  handle: Exclude<CropHandle, 'move'>;
  rect: CropRect;
  bounds: Size;
  onChange: (rect: CropRect) => void;
};

const positions: Record<ReceiptCropHandleProps['handle'], string> = {
  'top-left': '-top-[22px] -left-[22px]',
  'top-right': '-top-[22px] -right-[22px]',
  'bottom-left': '-bottom-[22px] -left-[22px]',
  'bottom-right': '-right-[22px] -bottom-[22px]',
};

export function ReceiptCropHandle({ handle, rect, bounds, onChange }: ReceiptCropHandleProps) {
  const gesture = useCropGesture({ rect, handle, bounds, onChange });

  return (
    <GestureDetector gesture={gesture}>
      <View testID={`receipt-crop-${handle}`} className={`absolute size-11 items-center justify-center ${positions[handle]}`}>
        <View className="size-5 rounded-full border-2 border-black bg-white" />
      </View>
    </GestureDetector>
  );
}
