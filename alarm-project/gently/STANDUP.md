# Stand-up log

## Step 1: Scaffold (2026-09-16)

**Done**
- Created the Expo app in `alarm-project/gently` (Expo SDK 57, React Native 0.86, TypeScript strict, expo-router with routes in `src/app`).
- Removed the Expo example screens, components and images, plus the packages only they used (`expo-device`, `expo-image`, `expo-web-browser`, `expo-glass-effect`, `@expo/ui`).
- Tailwind through **NativeWind 4.2.7** (Tailwind 3.4): `tailwind.config.js`, `babel.config.js`, `metro.config.js`, `src/global.css`, `nativewind-env.d.ts`, plus `css.d.ts` so TypeScript 6 accepts the CSS import.
- Fonts from the prototype, **Archivo** (400/500/600/700) and **DM Mono** (400/500), loaded in `src/app/_layout.tsx`. The splash screen stays up until they're ready. Tailwind classes: `font-sans`, `font-sans-bold`, `font-mono`, etc.
- Libraries for later steps: `dayjs`, `expo-audio` (+ `expo-asset`), `react-native-svg`, `expo-linear-gradient`.
- `app.json`: name "Gently", dark UI, background `#0A0605` (the prototype's night-sky top colour), iOS bundle id `com.gently.alarm`.
- Temporary home screen that shows Tailwind and both fonts working.
- Empty `src/components`, `src/lib`, `src/theme` folders for the next steps.

**Checks**
- `npx tsc --noEmit`: passes
- `npx expo-doctor`: 21/21 checks pass
- `npx expo export --platform ios --platform web`: both bundles build, and Tailwind classes compile (e.g. `.font-mono{font-family:DMMono_400Regular}`)

**Notes / blockers**
- Xcode isn't installed on this Mac (`xcrun simctl` is missing), so there's no iOS simulator. You can run the app now with Expo Go on your iPhone (`npm start`, scan the QR code). Xcode will be required from step 9 (AlarmKit and the Live Activity).

**Next:** step 2, design tokens (sunrise palette, gradients, typography) in `src/theme`.
