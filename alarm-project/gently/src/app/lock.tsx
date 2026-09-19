import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BreathingDot } from '@/components/BreathingDot';
import { DotClock } from '@/components/DotClock';
import { SkyBackground } from '@/components/SkyBackground';
import { SlideToStop } from '@/components/SlideToStop';
import { SnoozeButton } from '@/components/SnoozeButton';
import { SubLine } from '@/components/SubLine';
import {
  MAX_SNOOZES,
  describeScreen,
  nextSnoozeSeconds,
  snoozeButtonLabel,
  type AlarmState,
} from '@/lib/alarm';
import { textStyles } from '@/theme';

/** The prototype's two clock widths. */
const CLOCK_WIDTH = { full: '86%', small: '52%' } as const;

/**
 * How long the finished screen stays up after the alarm is stopped, before the
 * app opens. Long enough to read what it says, short enough not to be in the
 * way of someone who is now getting out of bed.
 */
const STOPPED_HOLD_MS = 5000;

/**
 * The lock screen, and deliberately almost nothing else.
 *
 * Half asleep in the dark there are only two things you can do: stop it, or
 * snooze it once it is ringing. Everything to do with setting the alarm or
 * choosing a sound lives on the app page.
 *
 * On a real phone iOS draws the status bar, the dynamic island and the home
 * indicator, so none of those are rebuilt here — `SafeAreaView` just keeps our
 * content clear of them.
 */
export default function LockScreen() {
  const router = useRouter();
  const [state, setState] = useState<AlarmState>('armed');
  const [secondsLeft, setSecondsLeft] = useState(32461); // 9:01:01
  const [snoozeLeft, setSnoozeLeft] = useState(0);
  const [snoozesUsed, setSnoozesUsed] = useState(0);

  const screen = describeScreen({ state, secondsLeft, snoozeLeft, snoozesUsed });

  // One ticker for the whole screen. Only two states count down.
  useEffect(() => {
    if (state !== 'armed' && state !== 'snoozed') return;

    const tick = setInterval(() => {
      if (state === 'armed') {
        setSecondsLeft((left) => Math.max(0, left - 1));
      } else {
        setSnoozeLeft((left) => Math.max(0, left - 1));
      }
    }, 1000);

    return () => clearInterval(tick);
  }, [state]);

  // When the snooze runs out, the alarm rings again.
  useEffect(() => {
    if (state === 'snoozed' && snoozeLeft === 0) {
      setState('ringing');
    }
  }, [state, snoozeLeft]);

  // Once it is stopped, hold the finished screen for a moment and then open
  // the app. `replace` rather than `push`, so going back cannot land on a lock
  // screen for an alarm that is already done.
  useEffect(() => {
    if (state !== 'stopped') return;

    const openApp = setTimeout(() => router.replace('/'), STOPPED_HOLD_MS);

    return () => clearTimeout(openApp);
  }, [state, router]);

  function snooze() {
    // The length comes from the count before this one, so the first snooze is
    // the longest — that is why the increment happens after we read it.
    setSnoozeLeft(nextSnoozeSeconds(snoozesUsed));
    setState('snoozed');
    setSnoozesUsed((used) => Math.min(used + 1, MAX_SNOOZES));
  }

  return (
    <View className="flex-1 bg-surface-screen">
      <SkyBackground state={screen.sky} />

      <SafeAreaView edges={['top', 'bottom']} className="flex-1 px-4 pb-4">
        <View className="flex-1 items-center justify-center" style={{ gap: 9, paddingBottom: 22 }}>
          <Text style={textStyles.capLabel} className="text-onSky-text/80">
            {screen.label}
          </Text>

          <DotClock value={screen.clock} style={{ width: CLOCK_WIDTH[screen.clockSize] }} />

          <SubLine parts={screen.sub} />

          {/* The alarm is done and the app is about to open — see the effect
              above. Without this the screen would just jump on its own. */}
          {state === 'stopped' && (
            <Text style={textStyles.capLabel} className="mt-1 text-onSky-text/60">
              Opening Gently…
            </Text>
          )}

          {/* The sound is rising but the alarm is not ringing yet. */}
          {state === 'window' && <BreathingDot />}

          {state === 'ringing' && (
            <SnoozeButton label={snoozeButtonLabel(snoozesUsed)} onPress={snooze} />
          )}
        </View>

        {screen.showTray && <SlideToStop onStop={() => setState('stopped')} />}
      </SafeAreaView>
    </View>
  );
}
