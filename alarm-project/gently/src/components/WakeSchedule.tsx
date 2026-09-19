import { Pressable, Text, View } from 'react-native';

import { SectionHeader } from '@/components/SectionHeader';
import { formatMonth, weekFrom } from '@/lib/schedule';
import { formatDialTime } from '@/lib/time';
import { colors, textStyles } from '@/theme';

type WakeScheduleProps = {
  now: Date;
  /** One wake time per weekday, `0` = Sunday. */
  wakeTimes: number[];
  /** Which weekday the dial is currently editing. */
  selectedWeekday: number;
  onSelectWeekday: (weekday: number) => void;
};

/**
 * The coming week, each day with its own wake time.
 *
 * Tap a day to edit it — the dial above then sets that day's time. The times
 * are stored per weekday rather than per date, so the week repeats: set Monday
 * once and it stays set every Monday.
 */
export function WakeSchedule({
  now,
  wakeTimes,
  selectedWeekday,
  onSelectWeekday,
}: WakeScheduleProps) {
  const days = weekFrom(now);

  return (
    <View>
      <SectionHeader
        label="Wake schedule"
        right={
          <Text style={textStyles.capLabel} className="text-ink-muted">
            {formatMonth(now)}
          </Text>
        }
      />

      <View className="pb-6">
        {days.map((day, index) => {
          const selected = day.weekdayIndex === selectedWeekday;

          return (
            <Pressable
              key={day.weekdayIndex}
              onPress={() => onSelectWeekday(day.weekdayIndex)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={`${day.weekday}, wakes at ${formatDialTime(wakeTimes[day.weekdayIndex])}`}
              className="mt-1 flex-row items-center gap-4 rounded-xl px-3 py-3"
              style={{
                backgroundColor: selected ? colors.surface.sunken : 'transparent',
                borderWidth: 1,
                borderColor: selected ? colors.line.strong : 'transparent',
              }}>
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: day.isWeekend ? colors.ink.muted : colors.accent.base,
                }}
              />

              <Text style={textStyles.capLabel} className="w-9 text-ink-muted">
                {day.weekday}
              </Text>

              <Text style={textStyles.body} className="flex-1 text-ink-primary">
                {day.dayOfMonth}
              </Text>

              {/* Today is the first row; saying so saves reading the dates. */}
              {index === 0 && (
                <Text style={textStyles.capLabel} className="text-ink-muted">
                  Today
                </Text>
              )}

              <Text
                style={textStyles.sub}
                className={selected ? 'text-accent-base' : 'text-ink-primary'}>
                {formatDialTime(wakeTimes[day.weekdayIndex])}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
