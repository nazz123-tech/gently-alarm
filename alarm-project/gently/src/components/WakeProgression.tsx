import { Text, View } from 'react-native';

import { SectionHeader } from '@/components/SectionHeader';
import { CYCLE_LENGTH, buildCycle } from '@/lib/cycle';
import { findSoundscape } from '@/lib/soundscapes';
import { colors, textStyles } from '@/theme';

/** Width of the little bar showing how loud each step is. */
const BAR_WIDTH = 44;
const BAR_HEIGHT = 3;

type WakeProgressionProps = {
  wakeMinutes: number;
  windowMinutes: number;
  /** The chosen soundscape, which names the two middle steps. */
  soundscapeId: string;
  /** Which day this belongs to, e.g. `MON`. */
  dayLabel: string;
};

/**
 * How the wake window unfolds: five sounds, each a little louder, ending on
 * the alarm itself.
 *
 * This used to be two sections — a three-beat strip and a five-row list — which
 * were the same five steps shown twice. They are one list now, with the bar
 * carrying what the strip was really for: you can see the sound rising without
 * reading a single number.
 *
 * Nothing here is stored. The times come from the wake time, so rolling the
 * dial moves the whole thing; the two middle names come from the soundscape,
 * so switching to Ocean turns "Rain on glass" into "Tide on sand".
 */
export function WakeProgression({
  wakeMinutes,
  windowMinutes,
  soundscapeId,
  dayLabel,
}: WakeProgressionProps) {
  const steps = buildCycle(wakeMinutes, windowMinutes, findSoundscape(soundscapeId));

  return (
    <View>
      <SectionHeader
        label="Wake progression"
        right={
          <Text style={textStyles.capLabel} className="text-ink-muted">
            {dayLabel} · {windowMinutes} min
          </Text>
        }
      />

      <View className="pb-6">
        {steps.map((step, index) => {
          const isWake = index === CYCLE_LENGTH - 1;

          return (
            <View key={step.number} className="flex-row items-center gap-4 py-2.5">
              <View
                className="items-center justify-center rounded-full"
                style={{
                  width: 28,
                  height: 28,
                  borderWidth: 1,
                  borderColor: isWake ? colors.accent.base : colors.line.strong,
                }}>
                <Text
                  style={textStyles.capLabel}
                  className={isWake ? 'text-accent-base' : 'text-ink-muted'}>
                  {step.number}
                </Text>
              </View>

              <View className="flex-1">
                <Text style={textStyles.body} className="text-ink-primary">
                  {step.name}
                </Text>
                <Text style={textStyles.capLabel} className="text-ink-muted">
                  {step.detail}
                </Text>
              </View>

              <View className="items-end gap-1.5">
                <Text
                  style={textStyles.sub}
                  className={isWake ? 'text-accent-base' : 'text-ink-primary'}>
                  {step.at}
                </Text>

                <View className="flex-row items-center gap-2">
                  <LevelBar level={step.level} isWake={isWake} />
                  <Text style={textStyles.capLabel} className="text-ink-muted">
                    {String(step.level).padStart(3, ' ')}%
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

/** A read-only bar. The last step is the alarm, so it gets the accent. */
function LevelBar({ level, isWake }: { level: number; isWake: boolean }) {
  return (
    <View
      style={{
        width: BAR_WIDTH,
        height: BAR_HEIGHT,
        borderRadius: BAR_HEIGHT / 2,
        backgroundColor: colors.line.strong,
        overflow: 'hidden',
      }}>
      <View
        style={{
          width: `${level}%`,
          height: '100%',
          backgroundColor: isWake ? colors.accent.base : colors.ink.secondary,
        }}
      />
    </View>
  );
}
