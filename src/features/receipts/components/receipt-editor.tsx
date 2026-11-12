import type { CropRect, ReceiptEditorError, ReceiptImage, ReceiptSource, Size } from '@/features/receipts/types';
import { RotateCcw, RotateCw, Undo2 } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Modal, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Image, Text } from '@/components/ui';
import { ReceiptCropFrame } from '@/features/receipts/components/receipt-crop-frame';
import { ReceiptEditorTool } from '@/features/receipts/components/receipt-editor-tool';
import { compressReceiptImage } from '@/features/receipts/utils/compress-receipt-image';
import { getContainSize } from '@/features/receipts/utils/get-contain-size';
import { renderReceiptSource } from '@/features/receipts/utils/render-receipt-source';
import { toImageCrop } from '@/features/receipts/utils/to-image-crop';
import { deleteRecordingFile } from '@/features/voice/utils/delete-recording-file';

export type ReceiptEditorProps = {
  source: ReceiptSource;
  maxBytes: number;
  onReady: (image: ReceiptImage) => void;
  onCancel: () => void;
};

const areaInset = 24;

const errorKeys: Record<ReceiptEditorError, string> = {
  'too-large': 'receipts.tooLarge',
  'failed': 'receipts.failed',
};

export function ReceiptEditor({ source, maxBytes, onReady, onCancel }: ReceiptEditorProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [image, setImage] = React.useState(source);
  const [rotation, setRotation] = React.useState(0);
  const [area, setArea] = React.useState<Size | null>(null);
  const [crop, setCrop] = React.useState<CropRect | null>(null);
  const [isBusy, setIsBusy] = React.useState(false);
  const [error, setError] = React.useState<ReceiptEditorError | null>(null);
  const display = area ? getContainSize(image, area) : null;
  const rect = crop ?? (display ? { x: 0, y: 0, ...display } : null);

  React.useEffect(() => () => {
    if (image.uri !== source.uri)
      deleteRecordingFile(image.uri);
  }, [image.uri, source.uri]);

  const run = async (task: () => Promise<void>) => {
    setIsBusy(true);
    setError(null);
    try {
      await task();
    }
    catch {
      setError('failed');
    }
    finally {
      setIsBusy(false);
    }
  };

  const rotate = (delta: number) => run(async () => {
    const next = (rotation + delta + 360) % 360;
    setImage(next === 0 ? source : await renderReceiptSource(source.uri, next));
    setRotation(next);
    setCrop(null);
  });

  const reset = () => {
    setImage(source);
    setRotation(0);
    setCrop(null);
    setError(null);
  };

  const confirm = () => run(async () => {
    if (!display || !rect)
      return;
    const result = await compressReceiptImage(image.uri, toImageCrop(rect, display.width / image.width, image), maxBytes);
    if (result)
      onReady(result);
    else
      setError('too-large');
  });

  return (
    <Modal visible animationType="fade" statusBarTranslucent navigationBarTranslucent onRequestClose={onCancel}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View testID="receipt-editor" className="flex-1 bg-black" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
          <View className="flex-row items-center justify-between px-4 py-2">
            <Button testID="receipt-editor-cancel" variant="secondary" fullWidth={false} label={t('receipts.editor.cancel')} onPress={onCancel} />
            <Button testID="receipt-editor-use" fullWidth={false} label={t('receipts.editor.use')} onPress={confirm} disabled={isBusy || !rect} />
          </View>
          <View
            className="flex-1 items-center justify-center"
            onLayout={(event) => {
              setArea({ width: event.nativeEvent.layout.width - areaInset * 2, height: event.nativeEvent.layout.height - areaInset * 2 });
              setCrop(null);
            }}
          >
            {display && rect
              ? (
                  <View style={display}>
                    <Image source={{ uri: image.uri }} style={display} contentFit="fill" placeholder={null} accessibilityLabel={t('receipts.editor.image')} />
                    <ReceiptCropFrame rect={rect} bounds={display} onChange={setCrop} />
                  </View>
                )
              : null}
            {isBusy ? <ActivityIndicator testID="receipt-editor-busy" className="absolute" color="white" size="large" /> : null}
          </View>
          {error ? <Text testID="receipt-editor-error" className="px-4 text-center text-meta text-white">{t(errorKeys[error])}</Text> : null}
          <View className="flex-row justify-center gap-2 px-4 py-2">
            <ReceiptEditorTool testID="receipt-editor-rotate-left" icon={RotateCcw} label={t('receipts.editor.rotateLeft')} onPress={() => rotate(-90)} disabled={isBusy} />
            <ReceiptEditorTool testID="receipt-editor-rotate-right" icon={RotateCw} label={t('receipts.editor.rotateRight')} onPress={() => rotate(90)} disabled={isBusy} />
            <ReceiptEditorTool testID="receipt-editor-reset" icon={Undo2} label={t('receipts.editor.reset')} onPress={reset} disabled={isBusy} />
          </View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}
