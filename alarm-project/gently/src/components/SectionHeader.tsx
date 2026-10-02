import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { textStyles } from '@/theme';

type SectionHeaderProps = {
  label: string;
  /** Optional thing on the right — a count, a chip, a button. */
  right?: ReactNode;
};

/**
 * The small caps heading at the top of each card on the app page. Every
 * section uses this, which is what keeps the rhythm even all the way down.
 */
export function SectionHeader({ label, right }: SectionHeaderProps) {
  return (
    <View className="flex-row items-center justify-between pb-3 pt-4">
      <Text style={textStyles.eyebrow} className="text-onSky-text/60">
        {label}
      </Text>
      {right}
    </View>
  );
}
