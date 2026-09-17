import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BreathingDot } from '@/components/BreathingDot';
import { CollapseButton } from '@/components/CollapseButton';
import { DotClock } from '@/components/DotClock';
import { MuteButton } from '@/components/MuteButton';
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
import { colors, textStyles } from '@/theme';

/** The prototype's two clock widths. */
const CLOCK_WIDTH = { full: '86%', small: '52%' } as const;

/**
 * The lock screen.
 *
 * All the "what does this state look like" decisions live in
 * `describeScreen()` in `src/lib/alarm.ts`. This file only holds the state
 * itself, the once-a-second tick, and what the three buttons do.
 */
export default function LockScreen() {
  const [state, setState] = useState<AlarmState>('armed');
  const [collapsed, setCollapsed] = useState(false);
  const [muted, setMuted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(32461); // 9:01:01
  const [snoozeLeft, setSnoozeLeft] = useState(0);
  const [snoozesUsed, setSnoozesUsed] = useState(0);

  const screen = describeScreen({ state, collapsed, muted, secondsLeft, snoozeLeft, snoozesUsed });

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
      goTo('ringing');
    }
  }, [state, snoozeLeft]);

  /** Every state change also un-collapses, like the prototype's `set()`. */
  function goTo(next: AlarmState) {
    // Put time on the snooze clock on the way in, otherwise it reads zero and
    // the effect above would send us straight back to ringing.
    if (next === 'snoozed') {
      setSnoozeLeft(nextSnoozeSeconds(snoozesUsed));
    }

    setState(next);
    setCollapsed(false);
  }

  function snooze() {
    // The length comes from the count before this one, so the first snooze is
    // the longest — that is why the increment happens after goTo reads it.
    goTo('snoozed');
    // Capped so the sub-line can never read "Snooze 4 of 3".
    setSnoozesUsed((used) => Math.min(used + 1, MAX_SNOOZES));
  }

  return (
    <View className="flex-1 bg-surface-screen">
      <SkyBackground state={screen.sky} />

      <SafeAreaView edges={['top', 'bottom']} className="flex-1 px-4 pb-4">
        {screen.showChevron && (
          <View className="absolute right-4 top-0 z-10">
            <CollapseButton collapsed={collapsed} onPress={() => setCollapsed((was) => !was)} />
          </View>
        )}

        <View className="flex-1 items-center justify-center" style={{ gap: 9, paddingBottom: 22 }}>
          <Text style={textStyles.capLabel} className="text-onSky-text/80">
            {screen.label}
          </Text>

          <DotClock value={screen.clock} style={{ width: CLOCK_WIDTH[screen.clockSize] }} />

          <SubLine parts={screen.sub} />

          {state === 'window' && <BreathingDot />}

          {state === 'ringing' && (
            <SnoozeButton label={snoozeButtonLabel(snoozesUsed)} onPress={snooze} />
          )}

          {state === 'stopped' && (
            <Text
              style={[textStyles.note, { maxWidth: 210, textAlign: 'center', marginTop: 16 }]}
              className="text-onSky-text/70">
              We woke you here because you moved. Too early?
            </Text>
          )}
        </View>

        <StatePicker
          current={state}
          onPick={(next) => (next === 'snoozed' ? snooze() : goTo(next))}
        />

        {screen.showTray && (
          <View className="flex-row items-center" style={{ gap: 10 }}>
            <MuteButton muted={muted} onPress={() => setMuted((was) => !was)} />
            <SlideToStop onStop={() => goTo('stopped')} />
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const ALL_STATES: AlarmState[] = ['armed', 'window', 'ringing', 'snoozed', 'stopped'];

/**
 * Temporary: jump between states to see them, the same as the row of buttons
 * under the phone in the prototype. It comes out once the alarm can really be
 * scheduled.
 */
function StatePicker({
  current,
  onPick,
}: {
  current: AlarmState;
  onPick: (state: AlarmState) => void;
}) {
  return (
    <View className="mb-4 flex-row flex-wrap justify-center gap-2">
      {ALL_STATES.map((name) => (
        <Pressable
          key={name}
          onPress={() => onPick(name)}
          className="rounded-full px-3 py-1.5"
          style={{ backgroundColor: name === current ? colors.accent.base : colors.onSky.button }}>
          <Text
            style={[
              textStyles.chipLabel,
              { color: name === current ? colors.accent.on : colors.onSky.text },
            ]}>
            {name}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
