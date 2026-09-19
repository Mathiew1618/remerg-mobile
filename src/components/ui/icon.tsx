import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { cssInterop } from 'nativewind';
import type { ColorValue } from 'react-native';

/**
 * One icon component across two families.
 *
 * Ionicons alone cannot say what this app needs to say: there is no Rx symbol,
 * no hospital cross and no police badge in it. Material Community Icons has all
 * three, so services are drawn with the sign the service actually uses — an Rx
 * for substance use, a cross for health care, a badge for parole, a house for
 * housing — rather than a generic heart or circle. Ionicons stays for the
 * interface furniture (chevrons, close, search) where it is already consistent.
 *
 * Names are prefixed with their family (`mci:prescription`, `ion:chevron-back`)
 * so the union below is checked at compile time — a typo'd glyph is a type
 * error, not a blank square on someone's phone.
 */

// Lets an icon take `className`, mapping text color onto the `color` prop:
// <Icon name="mci:prescription" className="text-brand" />
const style = { target: 'style', nativeStyleToProp: { color: true } } as const;
cssInterop(Ionicons, { className: style });
cssInterop(MaterialCommunityIcons, { className: style });

type IonName = keyof typeof Ionicons.glyphMap;
type MciName = keyof typeof MaterialCommunityIcons.glyphMap;

export type IconName = `ion:${IonName}` | `mci:${MciName}`;

export type IconProps = {
  name: IconName;
  size?: number;
  /** Tailwind text-* class sets the glyph color. */
  className?: string;
  color?: ColorValue;
};

export function Icon({ name, size = 22, className, color }: IconProps) {
  const [family, glyph] = splitName(name);
  const props = { size, className, color } as const;

  return family === 'mci' ? (
    <MaterialCommunityIcons name={glyph as MciName} {...props} />
  ) : (
    <Ionicons name={glyph as IonName} {...props} />
  );
}

/** `"mci:prescription"` -> `["mci", "prescription"]`. */
function splitName(name: IconName): ['ion' | 'mci', string] {
  const at = name.indexOf(':');
  return [name.slice(0, at) as 'ion' | 'mci', name.slice(at + 1)];
}
