import type { ImageManipulatorContext, ImageRef } from 'expo-image-manipulator';
import { ImageManipulator } from 'expo-image-manipulator';
import { getTargetSize } from '@/features/receipts/utils/get-target-size';

export async function renderFittedImage(context: ImageManipulatorContext, maxEdge: number): Promise<ImageRef> {
  const image = await context.renderAsync();
  const size = getTargetSize(image, maxEdge);
  if (size.width === image.width && size.height === image.height)
    return image;
  return ImageManipulator.manipulate(image).resize(size).renderAsync();
}
