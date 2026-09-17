import type { ReactNode } from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';

import { colors } from '@/theme';

type IconButtonProps = {
  onPress: () => void;
  /** Read out by VoiceOver — always pass one, the button has no text. */
  accessibilityLabel: string;
  children: ReactNode;
  /** Diameter in points. The prototype uses 30 for the chevron, 34 in the tray. */
  size?: number;
  /** Dims the button, for a control that is currently switched off (muted). */
  off?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * A round, translucent button that sits on top of the sky.
 *
 * It tints white rather than using a solid colour so the sunrise still shows
 * through. The prototype also blurs what is behind it (`backdrop-filter`);
 * that needs `expo-blur`, which we have not added — the tint alone reads
 * cleanly enough over a gradient.
 */
export function IconButton({
  onPress,
  accessibilityLabel,
  children,
  size = 34,
  off = false,
  style,
}: IconButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      style={({ pressed }) => [
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: off ? colors.onSky.buttonOff : colors.onSky.button,
          opacity: pressed ? 0.7 : 1,
        },
        style,
      ]}>
      {children}
    </Pressable>
  );
}
