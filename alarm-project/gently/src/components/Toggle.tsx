import { Pressable, View } from 'react-native';

import { colors } from '@/theme';

type ToggleProps = {
  on: boolean;
  onChange: (on: boolean) => void;
  accessibilityLabel: string;
};

/**
 * A plain on/off switch. The knob is moved by switching which end of the track
 * it aligns to, rather than by animating a position — one line instead of a
 * shared value, and at this size the difference is not visible.
 */
export function Toggle({ on, onChange, accessibilityLabel }: ToggleProps) {
  return (
    <Pressable
      onPress={() => onChange(!on)}
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: on }}
      hitSlop={8}
      style={{
        width: 52,
        height: 28,
        borderRadius: 14,
        padding: 3,
        justifyContent: 'center',
        alignItems: on ? 'flex-end' : 'flex-start',
        backgroundColor: on ? colors.line.strong : colors.line.soft,
      }}>
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 11,
          backgroundColor: on ? colors.ink.primary : colors.ink.muted,
        }}
      />
    </Pressable>
  );
}
