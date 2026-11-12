import type { CropHandle, CropRect, Size } from '@/features/receipts/types';
import { useRef } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { adjustCropRect } from '@/features/receipts/utils/adjust-crop-rect';

export type CropGestureOptions = {
  rect: CropRect;
  handle: CropHandle;
  bounds: Size;
  onChange: (rect: CropRect) => void;
};

export function useCropGesture({ rect, handle, bounds, onChange }: CropGestureOptions) {
  const start = useRef(rect);

  return Gesture.Pan()
    .runOnJS(true)
    .minDistance(0)
    .onStart(() => {
      start.current = rect;
    })
    .onUpdate((event) => {
      onChange(adjustCropRect(start.current, { handle, dx: event.translationX, dy: event.translationY }, bounds));
    });
}
