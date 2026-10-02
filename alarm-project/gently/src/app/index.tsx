import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/AppHeader';
import { Atmosphere } from '@/components/Atmosphere';
import { NextAwakening } from '@/components/NextAwakening';
import { SkyBackground } from '@/components/SkyBackground';
import { WakeProgression } from '@/components/WakeProgression';
import { WakeSchedule } from '@/components/WakeSchedule';
import { WAKE_WINDOW_MINUTES } from '@/lib/alarm';
import { dayKeyOf, nextAlarmAt } from '@/lib/schedule';
import { useAlarmSettings } from '@/lib/settings';
import { colors, textStyles } from '@/theme';

/** The days of the week, indexed the way `Date.getDay()` does it. */
const WEEKDAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

/**
 * The app page — everything you set, on one screen.
 *
 * The lock screen is deliberately bare, so this is where the wake times, the
 * cycle, the week and the soundscape all live. It sits on the lock screen's
 * night sky, so opening the app looks like the same place, not a settings
 * page bolted on. A day's time is set on its own screen, opened from the week.
 *
 * Wake times are stored one per weekday rather than one per date, so the week
 * repeats: set Monday once and every Monday is set.
 */
export default function AppPage() {
  const [now, setNow] = useState(() => new Date());
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Everything you set is remembered between launches. The day you happen to
  // be looking at is not — that is where you are in the app, not a setting.
  const { settings, update } = useAlarmSettings();
  const { wakeTimes, skippedDay, soundscapeId, level } = settings;

  const [selectedWeekday, setSelectedWeekday] = useState(() => new Date().getDay());

  // Once every half minute, not every second. Everything here works in whole
  // minutes, so waking the page more often than this just re-renders the
  // schedule and the countdown for no visible gain.
  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(tick);
  }, []);

  /** Show a day's progression here, and open it to set its time. */
  function editWeekday(weekday: number) {
    setSelectedWeekday(weekday);
    router.push({ pathname: '/edit', params: { weekday: String(weekday) } });
  }

  // The one number the lock screen needs: when the alarm actually goes off,
  // which is the one after a paused alarm. Everything it shows — the
  // countdown, the window, which state it is in — is worked out from this
  // against the real clock.
  const nextAlarm = nextAlarmAt(now, wakeTimes, skippedDay);

  // The header dot is lit unless the very next alarm is the paused one.
  const nextIsPaused = dayKeyOf(nextAlarmAt(now, wakeTimes)) === skippedDay;

  /**
   * Whether the wake window has already opened.
   *
   * The window runs for the half hour *before* the alarm, so a time set less
   * than that away is not "coming up" — it is already under way. Opening the
   * lock screen then drops you into the middle of a waking sequence, so the
   * link is switched off rather than leading somewhere surprising.
   */
  const windowRunning = (nextAlarm.getTime() - now.getTime()) / 60_000 < WAKE_WINDOW_MINUTES;

  const dayLabel = WEEKDAY_LABELS[selectedWeekday];
  const selectedWakeMinutes = wakeTimes[selectedWeekday];

  return (
    // No bottom edge: the page scrolls on behind the home indicator, and the
    // inset is added to the end of the content instead, so the last thing on
    // the page can still be scrolled clear of it.
    <View className="flex-1 bg-surface-screen">
      {/* Fixed behind the page rather than scrolling with it, the way a
          wallpaper sits behind a lock screen. */}
      <SkyBackground state="night" />

      <SafeAreaView edges={['top', 'left', 'right']} className="flex-1">
        <ScrollView
          contentContainerClassName="px-5"
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
          <AppHeader armed={!nextIsPaused} />

          <NextAwakening
            now={now}
            wakeTimes={wakeTimes}
            skippedDay={skippedDay}
            onSkippedDayChange={(value) => update({ skippedDay: value })}
          />

          <WakeSchedule
            now={now}
            wakeTimes={wakeTimes}
            skippedDay={skippedDay}
            selectedWeekday={selectedWeekday}
            onEditWeekday={editWeekday}
          />

          <WakeProgression
            wakeMinutes={selectedWakeMinutes}
            windowMinutes={WAKE_WINDOW_MINUTES}
            soundscapeId={soundscapeId}
            dayLabel={dayLabel}
          />

          <Atmosphere
            soundscapeId={soundscapeId}
            onSelect={(value) => update({ soundscapeId: value })}
            level={level}
            onLevelChange={(value) => update({ level: value })}
          />

          {/* Temporary, until the lock screen is a real iOS one.
            "Lock screen" opens it for the alarm that is actually set, running
            off the clock. "Test fade" opens it inside the wake window and runs
            the same fade over one minute instead of thirty, which is the only
            way to hear the quiet opening without sitting through it. */}
          <View className="flex-row gap-3 pb-6 pt-3">
            {/* No `state` here on purpose. The lock screen works out what it
              should be showing from the clock, and forcing one would pin it to
              "armed" even when the wake window had already started. */}
            {windowRunning ? (
              <View
                accessibilityRole="button"
                accessibilityState={{ disabled: true }}
                className="flex-1 items-center rounded-full py-3.5"
                style={{ backgroundColor: colors.onSky.buttonOff }}>
                <Text style={textStyles.chipLabel} className="text-onSky-text/30">
                  Lock screen
                </Text>
              </View>
            ) : (
              <Link
                href={{
                  pathname: '/lock',
                  params: {
                    soundscape: soundscapeId,
                    level: String(level),
                    alarmAt: String(nextAlarm.getTime()),
                  },
                }}
                asChild>
                <Pressable
                  accessibilityRole="button"
                  className="flex-1 items-center rounded-full py-3.5"
                  style={{ backgroundColor: colors.onSky.button }}>
                  <Text style={textStyles.chipLabel} className="text-onSky-text">
                    Lock screen
                  </Text>
                </Pressable>
              </Link>
            )}

            {/* This one does force it, because the whole point is to skip the
              waiting and run the fade over a minute. */}
            <Link
              href={{
                pathname: '/lock',
                params: {
                  soundscape: soundscapeId,
                  level: String(level),
                  alarmAt: String(nextAlarm.getTime()),
                  state: 'window',
                },
              }}
              asChild>
              <Pressable
                accessibilityRole="button"
                className="flex-1 items-center rounded-full py-3.5"
                style={{ backgroundColor: colors.onSky.button }}>
                <Text style={textStyles.chipLabel} className="text-onSky-text">
                  Test fade · 1 min
                </Text>
              </Pressable>
            </Link>
          </View>

          <View className="items-center pt-2">
            <Text style={textStyles.capLabel} className="text-onSky-text/60">
              Light rises before sound
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
