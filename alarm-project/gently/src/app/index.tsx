import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DotClock } from '@/components/DotClock';
import { formatCountdown } from '@/lib/time';
import { colors, gradients, textStyles, type SkyState } from '@/theme';

const SKY_STATES: SkyState[] = ['night', 'dawn', 'day'];

/** The prototype's two clock sizes: full countdown, and the collapsed time. */
const CLOCK_WIDTH = { full: '86%', collapsed: '52%' } as const;

// Temporary screen for step 3: the dot-grid clock counting down over the
// sunrise gradient. The real lock screen replaces it in a later step.
export default function HomeScreen() {
  const [sky, setSky] = useState<SkyState>('night');
  const [collapsed, setCollapsed] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(32461); // 9:01:01

  useEffect(() => {
    const tick = setInterval(() => {
      setSecondsLeft((left) => Math.max(0, left - 1));
    }, 1000);

    return () => clearInterval(tick);
  }, []);

  return (
    <View className="flex-1 bg-surface-screen">
      <LinearGradient {...gradients.sky[sky]} style={StyleSheet.absoluteFill} />

      <SafeAreaView className="flex-1 items-center justify-center gap-3 px-6">
        <Text style={textStyles.capLabel} className="text-onSky-text/80">
          {collapsed ? 'Alarm set for' : 'Getting up in'}
        </Text>

        <DotClock
          value={collapsed ? '7:42' : formatCountdown(secondsLeft)}
          style={{ width: collapsed ? CLOCK_WIDTH.collapsed : CLOCK_WIDTH.full }}
        />

        <Text style={textStyles.sub} className="text-onSky-text/70">
          Soft Rain · 7:30 – 8:00
        </Text>

        <View className="mt-8 flex-row gap-2">
          {SKY_STATES.map((name) => (
            <Chip key={name} label={name} selected={name === sky} onPress={() => setSky(name)} />
          ))}
          <Chip
            label={collapsed ? 'expand' : 'collapse'}
            selected={collapsed}
            onPress={() => setCollapsed((was) => !was)}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

type ChipProps = { label: string; selected: boolean; onPress: () => void };

function Chip({ label, selected, onPress }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      className="rounded-full px-4 py-2"
      style={{ backgroundColor: selected ? colors.accent.base : colors.onSky.button }}>
      <Text
        style={[textStyles.chipLabel, { color: selected ? colors.accent.on : colors.onSky.text }]}>
        {label}
      </Text>
    </Pressable>
  );
}
