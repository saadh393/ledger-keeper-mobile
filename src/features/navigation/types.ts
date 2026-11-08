import type { LucideIcon } from 'lucide-react-native';
import type { TxKeyPath } from '@/lib/i18n';

export type NavItem = {
  name: string;
  route: string;
  labelTx: TxKeyPath;
  icon: LucideIcon;
  testID: string;
};
