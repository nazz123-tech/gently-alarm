import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { SectionHeader } from '@/components/SectionHeader';
import { formatMonth, weekFrom } from '@/lib/schedule';
import { formatDialTime } from '@/lib/time';
import { colors, textStyles } from '@/theme';

type WakeScheduleProps = {
  now: Date;
  /** One wake time per weekday, `0` = Sunday. */
  wakeTimes: number[];
  /** The paused alarm's date, from `dayKeyOf`, or null. */
  skippedDay: string | null;
  /** Which weekday the wake progression is showing. */
  selectedWeekday: number;
  /** A day was tapped: show it below, and open it for editing. */
  onEditWeekday: (weekday: number) => void;
};

/**
 * The coming week, each day with its own wake time.
 *
 * Tap a day to set its time. The times are stored per weekday rather than per
 * date, so the week repeats: set Monday once and it stays set every Monday.
 */
export function WakeSchedule({
  now,
  wakeTimes,
  skippedDay,
  selectedWeekday,
  onEditWeekday,
}: WakeScheduleProps) {
  // The seven days only change when the date does. Without this they would be
  // rebuilt — seven date objects at a time — every time the page re-renders.
  const dayKey = now.toDateString();
  const days = useMemo(() => weekFrom(now), [dayKey]);

  return (
    <Card>
      <SectionHeader
        label="Wake schedule"
        right={
          <Text style={textStyles.capLabel} className="text-onSky-text/60">
            {formatMonth(now)}
          </Text>
        }
      />

      <View className="pb-2">
        {days.map((day, index) => {
          const selected = day.weekdayIndex === selectedWeekday;
          const paused = day.key === skippedDay;
          const time = formatDialTime(wakeTimes[day.weekdayIndex]);

          return (
            <Pressable
              key={day.weekdayIndex}
              onPress={() => onEditWeekday(day.weekdayIndex)}
              accessibilityRole="button"
              accessibilityHint="Opens the alarm editor"
              accessibilityLabel={`${day.weekday}, ${paused ? 'paused' : 'wakes'} at ${time}`}
              className="mt-1 flex-row items-center gap-4 rounded-xl px-3 py-3"
              style={({ pressed }) => ({
                backgroundColor: pressed || selected ? colors.onSky.buttonOff : 'transparent',
              })}>
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: day.isWeekend ? colors.onSky.line : colors.accent.base,
                }}
              />

              <Text style={textStyles.capLabel} className="w-9 text-onSky-text/60">
                {day.weekday}
              </Text>

              <Text style={textStyles.body} className="flex-1 text-onSky-text">
                {day.dayOfMonth}
              </Text>

              {/* A paused day says so, and that matters more than which day
                  is today. Today is the first row otherwise; saying so saves
                  reading the dates. */}
              {paused ? (
                <Text style={textStyles.capLabel} className="text-accent-light">
                  Paused
                </Text>
              ) : (
                index === 0 && (
                  <Text style={textStyles.capLabel} className="text-onSky-text/60">
                    Today
                  </Text>
                )
              )}

              <Text
                style={[textStyles.wheel, paused && { textDecorationLine: 'line-through' }]}
                className={paused ? 'text-onSky-text/40' : 'text-onSky-text'}>
                {time}
              </Text>

              <Text style={textStyles.wheel} className="text-onSky-text/40">
                ›
              </Text>
            </Pressable>
          );
        })}
      </View>
    </Card>
  );
}
