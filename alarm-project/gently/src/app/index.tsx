import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, gradients, textStyles, type SkyState } from '@/theme';

const SKY_STATES: SkyState[] = ['night', 'dawn', 'day'];

// Temporary screen for step 2: shows the sunrise gradients, the palette and the
// text styles from src/theme. The real lock screen replaces it in a later step.
export default function HomeScreen() {
  const [state, setState] = useState<SkyState>('night');

  return (
    <View className="flex-1 bg-surface-screen">
      <LinearGradient {...gradients.sky[state]} style={StyleSheet.absoluteFill} />

      <SafeAreaView className="flex-1 items-center justify-center gap-3 px-6">
        <Text style={textStyles.capLabel} className="text-onSky-text/80">
          Getting up in
        </Text>

        <Text style={textStyles.title} className="text-onSky-text">
          6h 42m
        </Text>

        <Text style={textStyles.sub} className="text-onSky-text/70">
          Soft Rain · 7:30 – 8:00
        </Text>

        <View className="mt-8 flex-row gap-2">
          {SKY_STATES.map((name) => {
            const selected = name === state;
            return (
              <Pressable
                key={name}
                onPress={() => setState(name)}
                className="rounded-full px-4 py-2"
                style={{
                  backgroundColor: selected ? colors.accent.base : colors.onSky.button,
                }}>
                <Text
                  style={[
                    textStyles.chipLabel,
                    { color: selected ? colors.accent.on : colors.onSky.text },
                  ]}>
                  {name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </SafeAreaView>
    </View>
  );
}
