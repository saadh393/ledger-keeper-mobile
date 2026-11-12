import type { ReceiptCaptureError, ReceiptImage, ReceiptSource, ReceiptSourceKind } from '@/features/receipts/types';
import { requestCameraPermissionsAsync } from 'expo-image-picker';
import { useCallback, useState } from 'react';
import { pickReceiptImage } from '@/features/receipts/utils/pick-receipt-image';
import { renderReceiptSource } from '@/features/receipts/utils/render-receipt-source';
import { deleteRecordingFile } from '@/features/voice/utils/delete-recording-file';
import { getPermissionDenial } from '@/features/voice/utils/get-permission-denial';

type ReceiptCaptureStep = 'idle' | 'choosing' | 'picking';

export function useReceiptCapture(onReady: (image: ReceiptImage) => void) {
  const [step, setStep] = useState<ReceiptCaptureStep>('idle');
  const [source, setSource] = useState<ReceiptSource | null>(null);
  const [error, setError] = useState<ReceiptCaptureError | null>(null);

  const open = useCallback(() => {
    setError(null);
    setStep('choosing');
  }, []);

  const dismiss = useCallback(() => {
    setStep(current => current === 'choosing' ? 'idle' : current);
  }, []);

  const choose = useCallback(async (kind: ReceiptSourceKind) => {
    setStep('picking');
    try {
      const denial = kind === 'camera' ? getPermissionDenial(await requestCameraPermissionsAsync()) : null;
      if (denial) {
        setError(denial);
        return;
      }
      const uri = await pickReceiptImage(kind);
      if (!uri)
        return;
      const prepared = await renderReceiptSource(uri, 0);
      deleteRecordingFile(uri);
      setSource(prepared);
    }
    catch {
      setError('failed');
    }
    finally {
      setStep('idle');
    }
  }, []);

  const cancel = useCallback(() => {
    deleteRecordingFile(source?.uri ?? null);
    setSource(null);
  }, [source]);

  const finish = useCallback((image: ReceiptImage) => {
    deleteRecordingFile(source?.uri ?? null);
    setSource(null);
    onReady(image);
  }, [onReady, source]);

  return { step, source, error, open, dismiss, choose, cancel, finish };
}
