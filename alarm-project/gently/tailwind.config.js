const { palette } = require('./src/theme/palette');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      // Same palette the TypeScript tokens export, so `bg-surface-base` and
      // `colors.surface.base` can never drift apart. See src/theme/palette.js.
      colors: palette,
      fontFamily: {
        // Names match the keys loaded with useFonts in src/app/_layout.tsx
        sans: ['Archivo_400Regular'],
        'sans-medium': ['Archivo_500Medium'],
        'sans-semibold': ['Archivo_600SemiBold'],
        'sans-bold': ['Archivo_700Bold'],
        mono: ['DMMono_400Regular'],
        'mono-medium': ['DMMono_500Medium'],
      },
      // CSS `em` tracking from the prototype, converted to the points React
      // Native expects. See the note in src/theme/typography.ts.
      letterSpacing: {
        eyebrow: '1.98px',
        cap: '2.28px',
        sub: '0.9px',
      },
    },
  },
  plugins: [],
};
