import { X } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from '@/components/ui';

export type ReceiptImageViewerProps = {
  uri: string;
  onClose: () => void;
};

export function ReceiptImageViewer({ uri, onClose }: ReceiptImageViewerProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View testID="receipt-image-viewer" className="flex-1 bg-black">
        <Image source={{ uri }} contentFit="contain" placeholder={null} accessibilityLabel={t('receipts.image.label')} className="flex-1" />
        <Pressable
          testID="receipt-image-close"
          accessibilityRole="button"
          accessibilityLabel={t('receipts.image.close')}
          onPress={onClose}
          className="absolute right-4 size-11 items-center justify-center rounded-full bg-black/55"
          style={{ top: insets.top + 8 }}
        >
          <X size={20} strokeWidth={1.75} color="#ffffff" />
        </Pressable>
      </View>
    </Modal>
  );
}
