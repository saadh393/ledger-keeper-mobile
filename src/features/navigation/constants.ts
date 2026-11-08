import type { NavItem } from '@/features/navigation/types';
import { BookOpen, CalendarClock, HandCoins, Settings, Sparkles } from 'lucide-react-native';

export const DRAWER_WIDTH = 288;
export const DRAWER_SCRIM_COLOR = 'rgba(0, 0, 0, 0.4)';
export const DRAWER_ANIMATION_DURATION = 240;

export const NAV_ITEMS: readonly NavItem[] = [
  {
    name: 'index',
    route: 'index',
    labelTx: 'navigation.ledger',
    icon: BookOpen,
    testID: 'drawer-nav-ledger',
  },
  {
    name: 'loans',
    route: 'loans',
    labelTx: 'navigation.loans',
    icon: HandCoins,
    testID: 'drawer-nav-loans',
  },
  {
    name: 'installments',
    route: 'installments',
    labelTx: 'navigation.installments',
    icon: CalendarClock,
    testID: 'drawer-nav-installments',
  },
  {
    name: 'credits',
    route: 'credits',
    labelTx: 'navigation.credits',
    icon: Sparkles,
    testID: 'drawer-nav-credits',
  },
  {
    name: 'settings',
    route: 'settings',
    labelTx: 'navigation.settings',
    icon: Settings,
    testID: 'drawer-nav-settings',
  },
] as const;
