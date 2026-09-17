import { Fragment } from 'react';
import { Text, View } from 'react-native';

import { colors, textStyles } from '@/theme';

type SubLineProps = {
  /** e.g. `['Soft Rain', '7:30 – 8:00']`. Joined with a small dot. */
  parts: string[];
};

/**
 * The line under the clock: soundscape, a dot, then the wake window — or
 * whatever the current state wants to say there.
 */
export function SubLine({ parts }: SubLineProps) {
  return (
    <View className="flex-row items-center" style={{ gap: 7 }}>
      {parts.map((part, index) => (
        <Fragment key={part}>
          {index > 0 && <Dot />}
          <Text style={textStyles.sub} className="text-onSky-text/70">
            {part}
          </Text>
        </Fragment>
      ))}
    </View>
  );
}

function Dot() {
  return (
    <View
      style={{
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: colors.onSky.text,
        opacity: 0.6,
      }}
    />
  );
}
