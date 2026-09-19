import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { textStyles } from '@/theme';

type SectionHeaderProps = {
  label: string;
  /** Optional thing on the right — a count, a chip, a button. */
  right?: ReactNode;
};

/**
 * The small caps heading that starts each block of the app page, with the
 * hairline above it. Every section on the page uses this, which is what keeps
 * the rhythm even all the way down.
 */
export function SectionHeader({ label, right }: SectionHeaderProps) {
  return (
    <View className="flex-row items-center justify-between border-t border-line-soft pb-3 pt-5">
      <Text style={textStyles.eyebrow} className="text-ink-muted">
        {label}
      </Text>
      {right}
    </View>
  );
}
