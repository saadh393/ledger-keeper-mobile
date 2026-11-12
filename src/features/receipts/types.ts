export type ReceiptSourceKind = 'camera' | 'gallery';

export type ReceiptCaptureError = 'permission-denied' | 'permission-blocked' | 'failed';

export type ReceiptEditorError = 'too-large' | 'failed';

export type ReceiptSource = {
  uri: string;
  width: number;
  height: number;
};

export type ReceiptImage = ReceiptSource & {
  sizeBytes: number;
  mimeType: 'image/jpeg';
};

export type Size = {
  width: number;
  height: number;
};

export type CropRect = Size & {
  x: number;
  y: number;
};

export type CropHandle = 'move' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export type CropDrag = {
  handle: CropHandle;
  dx: number;
  dy: number;
};

export type ImageCrop = Size & {
  originX: number;
  originY: number;
};
