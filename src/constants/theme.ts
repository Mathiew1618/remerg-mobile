/**
 * Remerg design tokens.
 *
 * Colors are lifted from the live remerg.com theme, which overrides Bootstrap's
 * defaults: `--bs-primary: rgb(3, 34, 86)` (navy) and `--bs-secondary:
 * rgb(80, 209, 147)` (mint). Crisis red stays Bootstrap's `--bs-danger` ramp so
 * it reads as "danger" to anyone who already knows the website.
 *
 * The light/dark `Colors` shape is kept intact because the Expo template
 * components (themed-text, themed-view, app-tabs) index into it by key.
 */

import '@/global.css';

import { Platform } from 'react-native';

/** Raw brand palette — theme-independent. */
export const Brand = {
  /** remerg.com --bs-primary */
  navy: '#032256',
  navyDeep: '#021638',
  navySoft: '#0B3A86',
  /** remerg.com --bs-secondary */
  mint: '#50D193',
  mintDeep: '#2FA972',
  mintSoft: '#E4F7EE',
  /** Crisis / emergency. Bootstrap --bs-danger ramp. */
  crisis: '#DC3545',
  crisisDeep: '#B02A37',
  crisisSoft: '#FDECEE',
} as const;

export const Colors = {
  light: {
    text: '#11181C',
    textSecondary: '#5A6572',
    background: '#FFFFFF',
    backgroundElement: '#F3F5F8',
    backgroundSelected: '#E3E8EF',
    border: '#DDE3EA',
    tint: Brand.navy,
    accent: Brand.mintDeep,
    accentSurface: Brand.mintSoft,
    crisis: Brand.crisis,
    crisisSurface: Brand.crisisSoft,
    onTint: '#FFFFFF',
  },
  dark: {
    text: '#ECEDEE',
    textSecondary: '#9BA6B2',
    background: '#0A0F18',
    backgroundElement: '#141C29',
    backgroundSelected: '#1E2938',
    border: '#243044',
    tint: '#7FB0FF',
    accent: Brand.mint,
    accentSurface: '#0F3527',
    crisis: '#FF6B78',
    crisisSurface: '#3A1116',
    onTint: '#04142E',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 18,
  pill: 999,
} as const;

/**
 * Minimum touch target. Deliberately above the 44pt floor: a chunk of this
 * audience is dialing one-handed, in a hurry, sometimes in crisis.
 */
export const HitSize = 56;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
