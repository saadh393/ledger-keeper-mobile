import type { DetectedItem } from '@/features/auto-capture/schemas/detected-item-schema';
import { canConfirmDetected } from '@/features/auto-capture/utils/can-confirm-detected';
import { formatBadgeCount } from '@/features/auto-capture/utils/format-badge-count';
import { getCaptureStatus } from '@/features/auto-capture/utils/get-capture-status';
import { keepInstalled } from '@/features/auto-capture/utils/keep-installed';
import { orderApps } from '@/features/auto-capture/utils/order-apps';

const apps = [
  { packageName: 'com.whatsapp', label: 'WhatsApp' },
  { packageName: 'com.google.android.gm', label: 'Gmail' },
  { packageName: 'com.bKash.customerapp', label: 'bKash' },
  { packageName: 'com.android.chrome', label: 'Chrome' },
];

describe('getCaptureStatus', () => {
  it('derives on, off and access removed', () => {
    expect(getCaptureStatus(true, true)).toBe('on');
    expect(getCaptureStatus(false, true)).toBe('off');
    expect(getCaptureStatus(false, false)).toBe('off');
    expect(getCaptureStatus(true, false)).toBe('accessRemoved');
  });
});

describe('formatBadgeCount', () => {
  it('hides zero and caps at 99+', () => {
    expect(formatBadgeCount(0)).toBeNull();
    expect(formatBadgeCount(7)).toBe('7');
    expect(formatBadgeCount(99)).toBe('99');
    expect(formatBadgeCount(100)).toBe('99+');
  });
});

describe('orderApps', () => {
  it('puts suggested apps first in suggestion order, then the rest alphabetically', () => {
    const result = orderApps(apps, ['com.bKash.customerapp', 'com.google.android.gm']);
    expect(result.suggested.map(app => app.label)).toEqual(['bKash', 'Gmail']);
    expect(result.others.map(app => app.label)).toEqual(['Chrome', 'WhatsApp']);
  });

  it('filters by name, case-insensitive', () => {
    const result = orderApps(apps, ['com.bKash.customerapp'], 'BKA');
    expect(result.suggested.map(app => app.label)).toEqual(['bKash']);
    expect(result.others).toEqual([]);
  });
});

describe('keepInstalled', () => {
  it('drops chosen apps that are no longer installed', () => {
    expect(keepInstalled(['com.whatsapp', 'com.removed.app'], apps)).toEqual(['com.whatsapp']);
  });
});

describe('canConfirmDetected', () => {
  const item: DetectedItem = { id: '1', packageName: 'p', appName: 'bKash', sourceText: 'x', receivedAt: '2026-11-12T10:00:00.000Z', kind: 'expense', title: 'Daraz', category: 'Shopping', amount: 450, currency: 'BDT', dateIso: '2026-11-12T10:00:00.000Z', duplicateOf: null };

  it('allows a fully parsed item', () => {
    expect(canConfirmDetected(item)).toBe(true);
  });

  it('blocks items with missing fields', () => {
    expect(canConfirmDetected({ ...item, amount: null })).toBe(false);
    expect(canConfirmDetected({ ...item, kind: null })).toBe(false);
    expect(canConfirmDetected({ ...item, title: ' ' })).toBe(false);
    expect(canConfirmDetected({ ...item, category: null })).toBe(false);
  });
});
