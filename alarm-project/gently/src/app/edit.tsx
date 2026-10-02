import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { DotClock } from '@/components/DotClock';
import { SkyBackground } from '@/components/SkyBackground';
import { SubLine } from '@/components/SubLine';
import { TimeWheel } from '@/components/TimeWheel';
import { WAKE_WINDOW_MINUTES } from '@/lib/alarm';
import { columnsFor } from '@/lib/dotFont';
import { useAlarmSettings } from '@/lib/settings';
import { findSoundscape } from '@/lib/soundscapes';
import { formatDialTime } from '@/lib/time';
import { textStyles } from '@/theme';

const WEEKDAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const MINUTES_PER_DAY = 24 * 60;

/** Points per dot-grid cell in the readout, so the two halves size alike. */
const CELL = 9;

/**
 * Degrees between neighbouring values. Each wheel goes exactly once round, so
 * 23 is followed by 00 and 59 by 00 — hence 360 / 24 and 360 / 60.
 */
const HOUR_STEP_DEGREES = 15;
const MINUTE_STEP_DEGREES = 6;

type Unit = 'hour' | 'minute';

/**
 * Setting one day's wake time.
 *
 * Opened by tapping a day in the wake schedule. The time is read out in the
 * lock screen's dot font, hours and minutes apart; tap one and the wheel
 * underneath sets it. Nothing is saved until Save, so Cancel really does leave
 * the day as it was.
 */
export default function EditAlarmScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ weekday?: string }>();

  const { settings, update } = useAlarmSettings();

  const weekday = Math.min(6, Math.max(0, Number(params.weekday ?? new Date().getDay()) || 0));

  const [minutesOfDay, setMinutesOfDay] = useState(settings.wakeTimes[weekday]);
  const [unit, setUnit] = useState<Unit>('hour');

  const hours = Math.floor(minutesOfDay / 60);
  const minutes = minutesOfDay % 60;

  function setHours(next: number) {
    setMinutesOfDay(next * 60 + minutes);
  }

  function setMinutes(next: number) {
    setMinutesOfDay(hours * 60 + next);
  }

  function save() {
    update({
      wakeTimes: settings.wakeTimes.map((existing, day) =>
        day === weekday ? minutesOfDay : existing,
      ),
    });
    router.back();
  }

  const windowStart = (minutesOfDay - WAKE_WINDOW_MINUTES + MINUTES_PER_DAY) % MINUTES_PER_DAY;

  return (
    <View className="flex-1 bg-surface-screen">
      <SkyBackground state="night" />

      <SafeAreaView
        edges={['top']}
        className="flex-1 px-5"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
        <View className="flex-row items-center justify-between py-3">
          <Pressable onPress={() => router.back()} accessibilityRole="button" hitSlop={12}>
            <Text style={textStyles.chipLabel} className="text-onSky-text/60">
              Cancel
            </Text>
          </Pressable>

          <Text style={textStyles.eyebrow} className="text-onSky-text">
            Edit alarm
          </Text>

          <Pressable onPress={save} accessibilityRole="button" hitSlop={12}>
            <Text style={textStyles.chipLabel} className="text-accent-light">
              Save
            </Text>
          </Pressable>
        </View>

        {/* The readout and the wheel are one block, held in the middle of the
            screen. At the bottom the wheel's white numbers sat on the bright
            band of the horizon, where they all but vanished. */}
        <View className="flex-1 justify-center" style={{ paddingBottom: 48 }}>
          <Text style={textStyles.capLabel} className="pb-6 text-center text-onSky-text/80">
            {WEEKDAY_NAMES[weekday]}
          </Text>

          <View className="flex-row items-start justify-center" style={{ gap: CELL }}>
            <ReadoutHalf
              label="Hour"
              value={hours}
              selected={unit === 'hour'}
              onPress={() => setUnit('hour')}
            />
            <DotClock value=":" style={{ width: CELL }} />
            <ReadoutHalf
              label="Minute"
              value={minutes}
              selected={unit === 'minute'}
              onPress={() => setUnit('minute')}
            />
          </View>

          <View style={{ height: 40 }} />

          {/* One wheel, re-made for whichever half is chosen, so it always
            starts out turned to that half's value. */}
          {unit === 'hour' ? (
            <TimeWheel
              key="hour"
              count={24}
              stepDegrees={HOUR_STEP_DEGREES}
              value={hours}
              onChange={setHours}
              accessibilityLabel="Wake hour"
            />
          ) : (
            <TimeWheel
              key="minute"
              count={60}
              stepDegrees={MINUTE_STEP_DEGREES}
              value={minutes}
              onChange={setMinutes}
              accessibilityLabel="Wake minute"
            />
          )}

          <View className="items-center pt-2">
            <SubLine
              parts={[
                findSoundscape(settings.soundscapeId).name,
                `${formatDialTime(windowStart)} – ${formatDialTime(minutesOfDay)}`,
              ]}
            />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

type ReadoutHalfProps = {
  label: string;
  value: number;
  selected: boolean;
  onPress: () => void;
};

/** Two digits and their name. The half not being set is dimmed. */
function ReadoutHalf({ label, value, selected, onPress }: ReadoutHalfProps) {
  const digits = String(value).padStart(2, '0');

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${label} ${digits}`}
      className="items-center"
      style={{ gap: 10, opacity: selected ? 1 : 0.35 }}>
      <DotClock value={digits} style={{ width: columnsFor(digits) * CELL }} />
      <Text style={textStyles.capLabel} className="text-onSky-text">
        {label}
      </Text>
    </Pressable>
  );
}
