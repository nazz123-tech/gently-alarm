/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        // Names match the keys loaded with useFonts in src/app/_layout.tsx
        sans: ['Archivo_400Regular'],
        'sans-medium': ['Archivo_500Medium'],
        'sans-semibold': ['Archivo_600SemiBold'],
        'sans-bold': ['Archivo_700Bold'],
        mono: ['DMMono_400Regular'],
        'mono-medium': ['DMMono_500Medium'],
      },
    },
  },
  plugins: [],
};
