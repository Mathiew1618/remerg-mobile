import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

/**
 * Every page scrolls through three full-width bands, top to bottom:
 *
 *   green  — the page's title and introduction, in remerg.com's mint
 *   blue   — the main content: white cards that pop against brand navy
 *   white  — the quieter end: sources, extra links, "call 211"
 *
 * Text colour depends on the band, so each band exports the classes to use
 * for anything written straight onto it (cards bring their own colours).
 */

export type BandTone = 'green' | 'blue' | 'white';

const BG: Record<BandTone, string> = {
  green: 'bg-accent',
  blue: 'bg-brand',
  white: 'bg-surface',
};

/** Classes for text written directly on a band (not inside a card). */
export const onBand: Record<BandTone, { title: string; body: string; muted: string }> = {
  green: { title: 'text-brand', body: 'text-brand', muted: 'text-brand/75' },
  blue: { title: 'text-white', body: 'text-white', muted: 'text-white/75' },
  white: { title: 'text-brand', body: 'text-ink', muted: 'text-muted' },
};

export function Band({
  tone,
  children,
  className = '',
}: {
  tone: BandTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <View className={BG[tone]}>
      <View className={`w-full self-center max-w-content px-4 py-6 ${className}`}>{children}</View>
    </View>
  );
}

/** A section heading in the website's style: bold, uppercase, tracked out. */
export function BandHeading({ tone, children, className = '' }: { tone: BandTone; children: ReactNode; className?: string }) {
  return (
    <Text className={`mb-3 text-[15px] font-extrabold uppercase tracking-wide ${onBand[tone].title} ${className}`}>
      {children}
    </Text>
  );
}
