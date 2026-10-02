import { memo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { LevelMeter } from '@/components/LevelMeter';
import { SectionHeader } from '@/components/SectionHeader';
import { MoonIcon } from '@/components/icons';
import { describeLevel, type LevelTone } from '@/lib/level';
import { MAX_DB, SOUNDSCAPES, findSoundscape } from '@/lib/soundscapes';
import { colors, textStyles } from '@/theme';

/** Both ends of the scale are a problem; only the middle is fine. */
const TONE_COLOUR: Record<LevelTone, string> = {
  low: colors.status.warn,
  good: colors.status.ok,
  high: colors.status.warn,
};

type AtmosphereProps = {
  soundscapeId: string;
  onSelect: (id: string) => void;
  /** 0–1. */
  level: number;
  onLevelChange: (level: number) => void;
};

/**
 * Choosing what you wake up to, and how loud.
 *
 * This and the dial are the two things you actually set, which is why they
 * both live on this page rather than on the lock screen.
 */
export const Atmosphere = memo(function Atmosphere({
  soundscapeId,
  onSelect,
  level,
  onLevelChange,
}: AtmosphereProps) {
  const chosen = findSoundscape(soundscapeId);
  const decibels = Math.round(level * MAX_DB);
  const advice = describeLevel(level);

  return (
    <Card>
      <SectionHeader label="Atmosphere" right={<MoonIcon size={15} color={colors.onSky.text} />} />

      <View className="pb-2">
        <View className="flex-row items-baseline justify-between">
          <Text style={textStyles.body} className="text-onSky-text">
            {chosen.name}
          </Text>
          <Text style={textStyles.sub} className="text-onSky-text">
            {decibels} dB
          </Text>
        </View>

        <Text style={textStyles.capLabel} className="pb-3 text-onSky-text/60">
          {chosen.subtitle}
        </Text>

        <LevelMeter value={level} onChange={onLevelChange} accessibilityLabel="Soundscape level" />

        {/* A number alone is no help when you are setting this at bedtime and
            cannot test it against tomorrow morning. */}
        <View className="mt-4 flex-row items-baseline gap-2">
          <Text style={[textStyles.capLabel, { color: TONE_COLOUR[advice.tone] }]}>
            {advice.label}
          </Text>
          <Text style={textStyles.hint} className="flex-1 text-onSky-text/60">
            {advice.advice}
          </Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2 py-4">
        {SOUNDSCAPES.map((sound) => {
          const selected = sound.id === chosen.id;

          return (
            <Pressable
              key={sound.id}
              onPress={() => onSelect(sound.id)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              className="rounded-full px-4 py-2"
              style={{
                backgroundColor: selected ? colors.onSky.button : 'transparent',
                borderWidth: 1,
                borderColor: selected ? colors.onSky.trackFill : colors.onSky.line,
              }}>
              <Text
                style={textStyles.chipLabel}
                className={selected ? 'text-onSky-text' : 'text-onSky-text/60'}>
                {sound.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </Card>
  );
});
