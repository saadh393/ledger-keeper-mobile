import type { ImagePickerOptions } from 'expo-image-picker';

export const receiptMaxEdge = 1600;
export const receiptSourceMaxEdge = 3200;
export const receiptSourceQuality = 0.95;
export const receiptQualitySteps = [0.85, 0.75, 0.65, 0.55, 0.45];
export const receiptMinCropSize = 48;
export const receiptPickerOptions: ImagePickerOptions = { mediaTypes: ['images'], quality: 1, exif: false };
