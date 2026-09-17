import { useEffect } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { IconButton } from '@/components/IconButton';
import { ChevronDownIcon } from '@/components/icons';
import { CHEVRON_TURN_MS, colors } from '@/theme';

type CollapseButtonProps = {
  /** True when the countdown is already collapsed to the plain alarm time. */
  collapsed: boolean;
  onPress: () => void;
};

/**
 * The small chevron in the top corner. Tapping it swaps the running countdown
 * for the plain alarm time; the arrow turns over to show it can go back.
 */
export function CollapseButton({ collapsed, onPress }: CollapseButtonProps) {
  const turn = useSharedValue(collapsed ? 1 : 0);

  useEffect(() => {
    turn.value = withTiming(collapsed ? 1 : 0, { duration: CHEVRON_TURN_MS });
  }, [collapsed, turn]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${turn.value * 180}deg` }],
  }));

  return (
    <IconButton
      size={30}
      onPress={onPress}
      accessibilityLabel={collapsed ? 'Show countdown' : 'Collapse countdown'}>
      <Animated.View style={animatedStyle}>
        <ChevronDownIcon size={13} color={colors.onSky.text} />
      </Animated.View>
    </IconButton>
  );
}
