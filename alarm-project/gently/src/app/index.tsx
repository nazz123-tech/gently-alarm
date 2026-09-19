import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/AppHeader';
import { Atmosphere } from '@/components/Atmosphere';
import { NextAwakening } from '@/components/NextAwakening';
import { NowBlock } from '@/components/NowBlock';
import { WakeProgression } from '@/components/WakeProgression';
import { WakeSchedule } from '@/components/WakeSchedule';
import { WakeTimePicker } from '@/components/WakeTimePicker';
import { WAKE_WINDOW_MINUTES } from '@/lib/alarm';
import { nextAlarmAt } from '@/lib/schedule';
import { textStyles } from '@/theme';

/** The days of the week, indexed the way `Date.getDay()` does it. */
const WEEKDAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

/** What every day starts out set to, until you change one. */
const DEFAULT_WAKE_MINUTES = 7 * 60 + 42; // 07:42

/**
 * The app page — everything you set, on one screen, built from
 * `context/app-looklike.png`.
 *
 * The lock screen is deliberately bare, so this is where the wake times, the
 * cycle, the week and the soundscape all live. Because it is a single page
 * they share plain `useState`, and the dial visibly drives everything below it.
 *
 * Wake times are stored one per weekday rather than one per date, so the week
 * repeats: set Monday once and every Monday is set.
 */
export default function AppPage() {
  const [now, setNow] = useState(() => new Date());
  const [wakeTimes, setWakeTimes] = useState<number[]>(() =>
    Array.from({ length: 7 }, () => DEFAULT_WAKE_MINUTES),
  );
  const [selectedWeekday, setSelectedWeekday] = useState(() => new Date().getDay());
  const [paused, setPaused] = useState(false);
  const [soundscapeId, setSoundscapeId] = useState('soft-rain');
  // 11 dB. The reference design shows 18, but on a phone that turns rain and
  // ocean into hiss — they are broadband, so past a point they stop sounding
  // like water and start sounding like static.
  const [level, setLevel] = useState(0.28);

  // Once every half minute, not every second. The only thing that shows
  // seconds is NowBlock, which keeps its own timer; everything here works in
  // whole minutes, so waking the page more often than this just re-renders the
  // schedule and the countdown for no visible gain.
  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(tick);
  }, []);

  /** The dial edits one day at a time; the rest of the week is untouched. */
  function setWakeTimeForSelectedDay(minutes: number) {
    setWakeTimes((times) =>
      times.map((existing, weekday) => (weekday === selectedWeekday ? minutes : existing)),
    );
  }

  // The one number the lock screen needs: when the alarm actually goes off.
  // Everything it shows — the countdown, the window, which state it is in — is
  // worked out from this against the real clock.
  const nextAlarm = nextAlarmAt(now, wakeTimes);

  const dayLabel = WEEKDAY_LABELS[selectedWeekday];
  const selectedWakeMinutes = wakeTimes[selectedWeekday];

  return (
    <SafeAreaView className="flex-1 bg-surface-base">
      <ScrollView contentContainerClassName="px-5 pb-12">
        <AppHeader armed={!paused} />

        <NowBlock />

        <NextAwakening
          now={now}
          wakeTimes={wakeTimes}
          paused={paused}
          onPausedChange={setPaused}
        />

        <WakeTimePicker
          minutesOfDay={selectedWakeMinutes}
          onChange={setWakeTimeForSelectedDay}
          windowMinutes={WAKE_WINDOW_MINUTES}
          dayLabel={dayLabel}
        />

        <WakeProgression
          wakeMinutes={selectedWakeMinutes}
          windowMinutes={WAKE_WINDOW_MINUTES}
          soundscapeId={soundscapeId}
          dayLabel={dayLabel}
        />

        <WakeSchedule
          now={now}
          wakeTimes={wakeTimes}
          selectedWeekday={selectedWeekday}
          onSelectWeekday={setSelectedWeekday}
        />

        <Atmosphere
          soundscapeId={soundscapeId}
          onSelect={setSoundscapeId}
          level={level}
          onLevelChange={setLevel}
        />

        <View className="flex-row items-center justify-between border-t border-line-soft pt-5">
          <Text style={textStyles.capLabel} className="text-ink-muted">
            Light rises before sound
          </Text>

          {/* Temporary, until the lock screen is a real iOS one.
              "Lock screen" opens it for the alarm that is actually set, running
              off the clock. "Test fade" opens it inside the wake window and
              runs the same fade over one minute instead of thirty, which is the
              only way to hear the quiet opening without sitting through it. */}
          <View className="flex-row gap-5">
            {(['armed', 'window'] as const).map((openAs) => (
              <Link
                key={openAs}
                href={{
                  pathname: '/lock',
                  params: {
                    soundscape: soundscapeId,
                    level: String(level),
                    state: openAs,
                    alarmAt: String(nextAlarm.getTime()),
                  },
                }}
                asChild>
                <Pressable accessibilityRole="button" hitSlop={8}>
                  <Text style={textStyles.chipLabel} className="text-ink-secondary">
                    {openAs === 'armed' ? 'Lock screen' : 'Test fade · 1 min'}
                  </Text>
                </Pressable>
              </Link>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
