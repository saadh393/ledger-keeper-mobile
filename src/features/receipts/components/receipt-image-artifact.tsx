import type { ArtifactComponentProps } from '@/features/assistant/components/artifacts/artifact-registry';
import type { ReceiptImageArtifactData } from '@/features/receipts/schemas/receipt-artifact-schemas';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { Image } from '@/components/ui';
import { ReceiptImagePlaceholder } from '@/features/receipts/components/receipt-image-placeholder';
import { ReceiptImageViewer } from '@/features/receipts/components/receipt-image-viewer';
import { ReceiptScanningOverlay } from '@/features/receipts/components/receipt-scanning-overlay';

const defaultRatio = 3 / 4;

export function ReceiptImageArtifact({ data }: ArtifactComponentProps<ReceiptImageArtifactData>) {
  const { t } = useTranslation();
  const [failed, setFailed] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const { image, previewUri } = data;
  const source = previewUri ?? image?.thumbnailUrl;
  const ratio = image?.width && image.height ? image.width / image.height : defaultRatio;

  if (!source || failed)
    return <ReceiptImagePlaceholder />;

  return (
    <View testID="receipt-image" className="w-60 overflow-hidden rounded-2xl border border-border bg-paper-200">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('receipts.image.open')}
        disabled={!image}
        onPress={() => setOpen(true)}
      >
        <Image
          source={{ uri: source }}
          contentFit="cover"
          contentPosition="top"
          onError={() => setFailed(true)}
          className="max-h-80 w-full"
          style={{ aspectRatio: ratio }}
        />
      </Pressable>
      {previewUri ? <ReceiptScanningOverlay /> : null}
      {open && image ? <ReceiptImageViewer uri={image.url} onClose={() => setOpen(false)} /> : null}
    </View>
  );
}
