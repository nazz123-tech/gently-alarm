import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text } from 'react-native';

import { colors, gradients, textStyles } from '@/theme';

type SnoozeButtonProps = {
  label: string;
  onPress: () => void;
};

/** The warm pill under the clock while the alarm is ringing. */
export function SnoozeButton({ label, onPress }: SnoozeButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({ marginTop: 6, opacity: pressed ? 0.85 : 1 })}>
      <LinearGradient
        {...gradients.snoozeButton}
        style={{ paddingVertical: 11, paddingHorizontal: 34, borderRadius: 999 }}>
        <Text style={[textStyles.buttonLabel, { color: colors.accent.onButton }]}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}
