/**
 * The app is light-only: every page is built from fixed green, blue and white
 * bands (components/ui/band.tsx), which have to look the same whatever the
 * phone's dark-mode setting is. So this always returns the light palette.
 */

import { Colors } from '@/constants/theme';

export function useTheme() {
  return Colors.light;
}
