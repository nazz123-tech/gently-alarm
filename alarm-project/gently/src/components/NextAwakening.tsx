import { Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { DotClock } from '@/components/DotClock';
import { SectionHeader } from '@/components/SectionHeader';
import { Toggle } from '@/components/Toggle';
import { dayKeyOf, formatUntil, nextAlarmAt, timeOfDay } from '@/lib/schedule';
import { formatDialTime } from '@/lib/time';
import { textStyles } from '@/theme';

/** Width of the dot clock — five characters at six points a cell. */
const CLOCK_WIDTH = 150;

type NextAwakeningProps = {
  now: Date;
  /** One wake time per weekday, `0` = Sunday. */
  wakeTimes: number[];
  /** The paused alarm's date, from `dayKeyOf`, or null. */
  skippedDay: string | null;
  onSkippedDayChange: (skippedDay: string | null) => void;
};

/**
 * When the alarm next goes off, and a switch to pause that one alarm.
 *
 * With a time per weekday this is not simply "today or tomorrow" any more — it
 * is whichever of the coming days comes round first, which `nextAlarmAt` works
 * out.
 *
 * Pausing skips only this alarm. The time shown stays the paused one, so the
 * switch always refers to the alarm written next to it; the one that will
 * actually ring instead is named underneath.
 */
export function NextAwakening({
  now,
  wakeTimes,
  skippedDay,
  onSkippedDayChange,
}: NextAwakeningProps) {
  const upcoming = nextAlarmAt(now, wakeTimes);
  const upcomingDay = dayKeyOf(upcoming);
  const paused = skippedDay === upcomingDay;
  const instead = paused ? nextAlarmAt(now, wakeTimes, skippedDay) : upcoming;

  return (
    <Card>
      <SectionHeader
        label="Next awakening"
        right={
          <View className="flex-row items-center gap-3">
            <Text style={textStyles.capLabel} className="text-onSky-text/60">
              Paused
            </Text>
            <Toggle
              on={paused}
              onChange={(value) => onSkippedDayChange(value ? upcomingDay : null)}
              accessibilityLabel="Pause the next alarm"
            />
          </View>
        }
      />

      {/* The same dot clock as the lock screen, so the time you set here is
          the time you see there. Dimmed while paused. */}
      <View className="gap-3 pb-4" style={{ opacity: paused ? 0.4 : 1 }}>
        <DotClock value={formatDialTime(timeOfDay(upcoming))} style={{ width: CLOCK_WIDTH }} />
      </View>
      <Text style={textStyles.sub} className="pb-3 text-onSky-text/70">
        {paused
          ? `Paused · then ${formatDialTime(timeOfDay(instead))} ${formatUntil(now, instead)}`
          : formatUntil(now, upcoming)}
      </Text>
    </Card>
  );
}
