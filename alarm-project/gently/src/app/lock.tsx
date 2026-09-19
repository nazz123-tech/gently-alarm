import { useLocalSearchParams, useRouter } from 'expo-router';
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
  WAKE_WINDOW_MINUTES,
  describeScreen,
  nextSnoozeSeconds,
  snoozeButtonLabel,
  type AlarmState,
} from '@/lib/alarm';
import { levelAt } from '@/lib/ramp';
import { timeOfDay } from '@/lib/schedule';
import { findSoundscape } from '@/lib/soundscapes';
import { formatDialTime } from '@/lib/time';
import { useWakeSound } from '@/lib/useWakeSound';
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
 * How long the wake window takes when previewing it.
 *
 * Only used when the screen is opened straight into a state from the app page.
 * A real window is `WAKE_WINDOW_MINUTES` long and runs off the clock; this is
 * the same curve over a minute, so the fade can be heard without waiting half
 * an hour for it.
 */
const PREVIEW_WINDOW_SECONDS = 60;

const MINUTE = 60_000;

/**
 * The lock screen, and deliberately almost nothing else.
 *
 * Everything shown here comes from one number: when the alarm goes off, handed
 * over by the app page as `alarmAt`. The countdown, the wake window, which
 * state the screen is in and how loud the soundscape is are all worked out
 * from that against the real clock — nothing is stored and nothing is faked.
 *
 * On a real phone iOS draws the status bar, the dynamic island and the home
 * indicator, so none of those are rebuilt here.
 */
export default function LockScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    soundscape?: string;
    level?: string;
    state?: string;
    alarmAt?: string;
  }>();

  const soundscape = findSoundscape(params.soundscape ?? '');
  const maxVolume = Number(params.level ?? 0.45);

  /** When the alarm goes off, as a timestamp. */
  const alarmAt = Number(params.alarmAt) || Date.now() + 8 * 60 * MINUTE;
  const windowStart = alarmAt - WAKE_WINDOW_MINUTES * MINUTE;

  const [now, setNow] = useState(() => Date.now());
  const [stopped, setStopped] = useState(false);
  const [snoozeUntil, setSnoozeUntil] = useState<number | null>(null);
  const [snoozesUsed, setSnoozesUsed] = useState(0);

  /**
   * A state forced by the link, for previewing. It is cleared the moment you
   * snooze or stop, so the screen goes back to following the clock rather than
   * being stuck in whatever it was opened into.
   */
  const [preview, setPreview] = useState<AlarmState | undefined>(
    params.state as AlarmState | undefined,
  );
  const [previewProgress, setPreviewProgress] = useState(0);

  useEffect(() => {
    const clock = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(clock);
  }, []);

  const state = resolveState();

  function resolveState(): AlarmState {
    if (preview) return preview;
    if (stopped) return 'stopped';
    if (snoozeUntil !== null) return now < snoozeUntil ? 'snoozed' : 'ringing';
    if (now >= alarmAt) return 'ringing';
    if (now >= windowStart) return 'window';
    return 'armed';
  }

  // Real windows are measured against the clock; a preview runs on its own.
  const windowProgress =
    preview === 'window'
      ? previewProgress
      : Math.min(1, Math.max(0, (now - windowStart) / (alarmAt - windowStart)));

  useEffect(() => {
    if (preview !== 'window') return;

    const startedAt = Date.now();
    const step = setInterval(() => {
      const elapsed = (Date.now() - startedAt) / 1000;
      const reached = Math.min(1, elapsed / PREVIEW_WINDOW_SECONDS);
      setPreviewProgress(reached);

      // The window ends at the alarm. Without this the preview stopped at
      // 100% and simply held there, so the thing the whole ramp builds up to
      // never actually happened.
      if (reached >= 1) setPreview('ringing');
    }, 250);

    return () => clearInterval(step);
  }, [preview]);

  const alarmLabel = formatDialTime(timeOfDay(new Date(alarmAt)));

  const screen = describeScreen({
    state,
    alarmLabel,
    windowLabel: `${formatDialTime(timeOfDay(new Date(windowStart)))} – ${alarmLabel}`,
    soundscapeName: soundscape.name,
    secondsLeft: Math.max(0, (alarmAt - now) / 1000),
    snoozeLeft: snoozeUntil === null ? 0 : Math.max(0, (snoozeUntil - now) / 1000),
    snoozesUsed,
    windowLevelPercent: Math.round(levelAt(windowProgress) * 100),
    minutesIntoWindow: Math.max(0, Math.round((now - windowStart) / MINUTE)),
  });

  // The soundscape fades up across the window; the alarm rings under it.
  useWakeSound({
    soundscapeId: soundscape.id,
    maxVolume,
    // Ringing is the last step of the same progression, not a different
    // event: the soundscape stays at the top of its ramp and the alarm joins
    // it. Cutting the sound out the moment the alarm starts would undo four
    // steps of not startling anybody.
    progress: state === 'window' ? windowProgress : state === 'ringing' ? 1 : null,
    ringing: state === 'ringing',
  });

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
    // the longest.
    setSnoozeUntil(Date.now() + nextSnoozeSeconds(snoozesUsed) * 1000);
    setSnoozesUsed((used) => Math.min(used + 1, MAX_SNOOZES));
    setPreview(undefined);
  }

  function stop() {
    setStopped(true);
    setPreview(undefined);
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

          {/* The sound is rising but the alarm is not ringing yet. */}
          {state === 'window' && <BreathingDot />}

          {state === 'ringing' && (
            <SnoozeButton label={snoozeButtonLabel(snoozesUsed)} onPress={snooze} />
          )}

          {state === 'stopped' && (
            <Text style={textStyles.capLabel} className="mt-1 text-onSky-text/60">
              Opening Gently…
            </Text>
          )}
        </View>

        {screen.showTray && <SlideToStop onStop={stop} />}
      </SafeAreaView>
    </View>
  );
}
