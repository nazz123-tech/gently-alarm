# Gently

A gradual-awakening alarm for iPhone. Instead of one loud sound at the wake
time, Gently opens a 30-minute wake window before it and brings the room up
slowly: five sounds, each louder than the last, ending in the alarm itself.

| Step | Sound | Level |
| --- | --- | --- |
| 1 | Soft breath: relaxing room tone | 5% |
| 2 | The chosen soundscape: steady, gentle texture | 45% |
| 3 | Soundscape + chime: clearer presence | 65% |
| 4 | Warm tone: ready when you are | 85% |
| 5 | Wake alarm | 100% |

- **One wake time per weekday.** Set Monday once and every Monday is set.
- **Five soundscapes:** Soft Rain, Ocean, Forest, Dawn Chorus, Fireplace.
- **Snoozes get shorter:** 9, then 6, then 4 minutes, so snoozing ends.
- **A dot-matrix lock screen** whose sky moves from night to dawn to day as
  the window runs.

Built with Expo SDK 57, React Native 0.86, Expo Router, NativeWind and
`expo-audio`. iOS is the target; Android is untested.

## Status

This is a work in progress. [`STANDUP.md`](STANDUP.md) is the running log of
every step, decision and dead end, and is the place to read first.

Open questions:

- **Does the fade survive a locked screen overnight?** The soundscape plays
  silently while the alarm is armed to keep iOS from suspending the app. This
  has not been proven on a phone through a whole night yet. The lock screen
  shows a temporary `audio … · longest pause …` line to diagnose it.
- **AlarmKit was tried and removed** (2026-09-24). Alarms scheduled but never
  rang, and it added a native module and a widget extension. The in-app alarm
  is the only one for now.

## Running it

```bash
npm install
npx expo start
```

Then open it in the iOS simulator or in [Expo Go](https://expo.dev/go). Expo Go
is fine for the UI and for "Test fade · 1 min", but not for anything involving
a locked screen: Expo Go uses its own native config, so this app's background
audio setting never reaches it.

The two buttons at the bottom of the app page are temporary test tools:
**Lock screen** opens the lock screen for the alarm that is actually set, and
**Test fade · 1 min** runs the whole 30-minute fade in one minute.

## Building for an iPhone

A real build is the only way to test the locked-screen behaviour. It runs on
this Mac with no Homebrew and no paid Apple Developer account.

### One-time setup

CocoaPods runs on the Ruby 2.6 that ships with macOS, through bundler:

```bash
gem install --user-install bundler
sh scripts/pod.sh --version   # should print 1.15.2
```

`scripts/pod.sh` sets up the PATH and loads
`scripts/ruby26-compat.rb`, which fixes a header path in Xcode 27's SDK so
native gems compile. See step 22 in `STANDUP.md` for why.

### Build and install

```bash
npx expo prebuild -p ios --clean --no-install
(cd ios && sh ../scripts/pod.sh install)
```

Then open `ios/Gently.xcworkspace` in Xcode, pick your iPhone, and run. Or from
the command line, with the phone connected:

```bash
cd ios
xcodebuild -workspace Gently.xcworkspace -scheme Gently -configuration Release \
  -destination 'id=<device id>' -derivedDataPath build/device \
  -allowProvisioningUpdates build
xcrun devicectl device install app --device <device id> \
  build/device/Build/Products/Release-iphoneos/Gently.app
```

`xcrun devicectl list devices` shows the device id. A Release build carries its
own JavaScript, so it runs without Metro.

- **Signing:** `plugins/withSigningTeam.js` writes the team into the Xcode
  project on every prebuild. Set `APPLE_TEAM_ID` to build on another account.
- **Free Apple ID:** the app stops opening after 7 days and has to be
  reinstalled. On the phone, trust the developer first under Settings →
  General → VPN & Device Management.
- **iOS 27:** the app adopts UIKit's scene lifecycle through
  `expo-build-properties` (`ios.enableSceneSupport`), without which iOS 27
  kills it at launch. The flag can go when upgrading to SDK 58, whose template
  adopts scenes itself.
- **Keychain popups:** if `codesign` keeps asking for the keychain password,
  click **Always Allow**.

## Project layout

```
src/app/          Screens: index.tsx (the app page), lock.tsx (the lock screen)
src/components/   UI pieces: DotClock, RotaryDial, WakeSchedule, SlideToStop…
src/lib/          Logic: the wake cycle, ramp, schedule, settings, useWakeSound
src/theme/        Colours, gradients, type; palette.js is the one source of colour
assets/sounds/    The soundscapes, the chime, the warm tone and the alarm
assets/images/    App icon, Android adaptive icons, splash, favicon
plugins/          Expo config plugins
scripts/          The CocoaPods toolchain for this Mac
STANDUP.md        The project log
```

The icon is a "G" drawn on the lock screen's 5×7 dot grid. Its lit dots fade
from warm white to the sunrise orange.
