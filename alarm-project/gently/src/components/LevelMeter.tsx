import { useRef } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

import { colors } from '@/theme';

const HEIGHT = 4;

type LevelMeterProps = {
  /** 0–1. */
  value: number;
  onChange: (value: number) => void;
  accessibilityLabel: string;
};

/**
 * The thin bar under the soundscape name. Drag anywhere along it to set the
 * level; the touch position along the track is the value, which is all there
 * is to it.
 *
 * It is drawn with two plain views rather than an SVG — a filled strip inside
 * a track is exactly what a percentage width gives you.
 */
export function LevelMeter({ value, onChange, accessibilityLabel }: LevelMeterProps) {
  // A ref, not a plain variable: setting the level re-renders this component,
  // and `onLayout` only fires when the layout actually changes — so a local
  // would be back to zero by the second drag and the bar would stop moving.
  const width = useRef(0);

  const onLayout = (event: LayoutChangeEvent) => {
    width.current = event.nativeEvent.layout.width;
  };

  function touchToValue(x: number) {
    if (width.current <= 0) return;
    onChange(Math.min(1, Math.max(0, x / width.current)));
  }

  const pan = Gesture.Pan()
    .minDistance(0)
    .onBegin((event) => runOnJS(touchToValue)(event.x))
    .onUpdate((event) => runOnJS(touchToValue)(event.x));

  return (
    <GestureDetector gesture={pan}>
      <View
        onLayout={onLayout}
        accessibilityRole="adjustable"
        accessibilityLabel={accessibilityLabel}
        // A thin bar is hard to hit, so the touch area is padded out.
        hitSlop={{ top: 14, bottom: 14 }}
        style={{
          height: HEIGHT,
          borderRadius: HEIGHT / 2,
          backgroundColor: colors.onSky.track,
          overflow: 'hidden',
        }}>
        <View
          style={{
            width: `${value * 100}%`,
            height: '100%',
            backgroundColor: colors.onSky.text,
          }}
        />
      </View>
    </GestureDetector>
  );
}
