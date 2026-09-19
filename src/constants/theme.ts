/**
 * Resolved color values, for the handful of React Native APIs that take a
 * color rather than a style.
 *
 * Styling lives in Tailwind now: `tailwind.config.js` maps semantic names onto
 * CSS variables and `src/global.css` defines them for light and dark. This file
 * exists because a few props — `placeholderTextColor`, `ActivityIndicator`'s
 * `color`, and React Navigation's theme and tab bar options — cannot take a
 * className.
 *
 * KEEP IN SYNC with the variables in src/global.css. If a color only ever
 * appears in JSX, it belongs there, not here.
 */

import '@/global.css';

export const Colors = {
  light: {
    text: '#11181C',
    textSecondary: '#5A6572',
    background: '#FFFFFF',
    border: '#DDE3EA',
    tint: '#032256',
  },
  dark: {
    text: '#ECEDEE',
    textSecondary: '#9BA6B2',
    background: '#0A0F18',
    border: '#243044',
    tint: '#7FB0FF',
  },
} as const;
