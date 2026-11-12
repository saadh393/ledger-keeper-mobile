import type { CropRect, Size } from '@/features/receipts/types';
import * as React from 'react';
import { View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import { ReceiptCropHandle } from '@/features/receipts/components/receipt-crop-handle';
import { useCropGesture } from '@/features/receipts/hooks/use-crop-gesture';

export type ReceiptCropFrameProps = {
  rect: CropRect;
  bounds: Size;
  onChange: (rect: CropRect) => void;
};

const handles = ['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const;

export function ReceiptCropFrame({ rect, bounds, onChange }: ReceiptCropFrameProps) {
  const gesture = useCropGesture({ rect, handle: 'move', bounds, onChange });

  return (
    <GestureDetector gesture={gesture}>
      <View
        testID="receipt-crop-frame"
        className="absolute border-2 border-white"
        style={{ left: rect.x, top: rect.y, width: rect.width, height: rect.height }}
      >
        {handles.map(handle => <ReceiptCropHandle key={handle} handle={handle} rect={rect} bounds={bounds} onChange={onChange} />)}
      </View>
    </GestureDetector>
  );
}
