import { Text, View } from 'react-native';

import { RotaryDial } from '@/components/RotaryDial';
import { SectionHeader } from '@/components/SectionHeader';
import { CYCLE_LENGTH } from '@/lib/cycle';
import { LAST_MINUTE_OF_DAY } from '@/lib/dial';
import { formatDialTime } from '@/lib/time';
import { colors, textStyles } from '@/theme';

type WakeTimePickerProps = {
  minutesOfDay: number;
  onChange: (minutesOfDay: number) => void;
  windowMinutes: number;
  /** Which day is being edited, e.g. `MON`. */
  dayLabel: string;
};

/**
 * The rotary dial and the card around it.
 *
 * The day being edited is named twice — in the section heading and again above
 * the dial — because the dial sits a long way down a scrolling page, and a
 * time picker that does not say what it is setting is a good way to change the
 * wrong day's alarm.
 */
export function WakeTimePicker({
  minutesOfDay,
  onChange,
  windowMinutes,
  dayLabel,
}: WakeTimePickerProps) {
  return (
    <View>
      <SectionHeader
        label="Set awakening"
        right={
          <Text style={textStyles.capLabel} className="text-accent-base">
            {dayLabel}
          </Text>
        }
      />

      <View className="mb-6 rounded-3xl bg-surface-raised p-5">
        <View className="flex-row items-center justify-between">
          <Text style={textStyles.eyebrow} className="text-ink-secondary">
            Roll to set {dayLabel}
          </Text>
          <View
            className="rounded-full px-3 py-1"
            style={{ borderWidth: 1, borderColor: colors.accent.base }}>
            <Text style={textStyles.capLabel} className="text-accent-base">
              {windowMinutes} min
            </Text>
          </View>
        </View>

        <Text style={textStyles.hint} className="mt-2 text-ink-muted">
          {CYCLE_LENGTH} sounds rise across {windowMinutes} minutes
        </Text>

        <View className="my-6 items-center">
          <RotaryDial minutesOfDay={minutesOfDay} onChange={onChange} />
        </View>

        <View className="flex-row items-center justify-between">
          <Text style={textStyles.hint} className="text-ink-muted">
            {formatDialTime(0)}
          </Text>
          <Text style={textStyles.capLabel} className="text-ink-muted">
            24 hour dial
          </Text>
          <Text style={textStyles.hint} className="text-ink-muted">
            {formatDialTime(LAST_MINUTE_OF_DAY)}
          </Text>
        </View>
      </View>
    </View>
  );
}
