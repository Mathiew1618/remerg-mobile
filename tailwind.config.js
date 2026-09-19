/**
 * Remerg design tokens for NativeWind.
 *
 * Every color resolves through a CSS variable defined in src/global.css, which
 * carries a light value on `:root` and a dark override under
 * `prefers-color-scheme: dark`. That means `bg-surface` is correct in both
 * themes with no `dark:` prefix and no JS branching — the old `useTheme()`
 * object only existed to do this by hand.
 *
 * Names are semantic, not literal: `brand`, `ink`, `muted`, `crisis`. A screen
 * should never have to know that brand navy is #032256.
 */

const withOpacity = (variable) => `rgb(var(${variable}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  // On native this follows the OS setting, matching the rest of the app.
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        surface: withOpacity('--color-surface'),
        elevated: withOpacity('--color-elevated'),
        selected: withOpacity('--color-selected'),
        line: withOpacity('--color-line'),
        ink: withOpacity('--color-ink'),
        muted: withOpacity('--color-muted'),
        brand: {
          DEFAULT: withOpacity('--color-brand'),
          on: withOpacity('--color-brand-on'),
          soft: withOpacity('--color-brand-soft'),
        },
        accent: {
          DEFAULT: withOpacity('--color-accent'),
          soft: withOpacity('--color-accent-soft'),
        },
        crisis: {
          DEFAULT: withOpacity('--color-crisis'),
          soft: withOpacity('--color-crisis-soft'),
        },
      },
      borderRadius: {
        card: '18px',
        field: '12px',
      },
      // Touch targets sit above the 44pt floor on purpose: a lot of this
      // audience is dialing one-handed, in a hurry, sometimes in crisis.
      minHeight: {
        touch: '56px',
        chip: '42px',
      },
      maxWidth: {
        content: '800px',
      },
    },
  },
  plugins: [],
};
