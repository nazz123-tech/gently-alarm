import { Text, View } from 'react-native';

import { SectionHeader } from '@/components/SectionHeader';
import { Toggle } from '@/components/Toggle';
import { formatUntil, nextAlarmAt, timeOfDay } from '@/lib/schedule';
import { formatDialTime } from '@/lib/time';
import { textStyles } from '@/theme';

type NextAwakeningProps = {
  now: Date;
  /** One wake time per weekday, `0` = Sunday. */
  wakeTimes: number[];
  paused: boolean;
  onPausedChange: (paused: boolean) => void;
};

/**
 * When the alarm next goes off, and a switch to pause it without losing it.
 *
 * With a time per weekday this is not simply "today or tomorrow" any more — it
 * is whichever of the coming days comes round first, which `nextAlarmAt` works
 * out.
 */
export function NextAwakening({ now, wakeTimes, paused, onPausedChange }: NextAwakeningProps) {
  const target = nextAlarmAt(now, wakeTimes);

  return (
    <View>
      <SectionHeader
        label="Next awakening"
        right={
          <View className="flex-row items-center gap-3">
            <Text style={textStyles.capLabel} className="text-ink-muted">
              Paused
            </Text>
            <Toggle on={paused} onChange={onPausedChange} accessibilityLabel="Pause the alarm" />
          </View>
        }
      />

      <View className="flex-row items-baseline gap-4 pb-6">
        <Text style={textStyles.title} className={paused ? 'text-ink-muted' : 'text-ink-primary'}>
          {formatDialTime(timeOfDay(target))}
        </Text>
        <Text style={textStyles.hint} className="text-ink-muted">
          {paused ? 'Paused' : formatUntil(now, target)}
        </Text>
      </View>
    </View>
  );
}
