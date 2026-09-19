import { memo } from 'react';
import { Text, View } from 'react-native';

import { colors, textStyles } from '@/theme';

/**
 * The bar across the top of the app page.
 *
 * The reference is branded "Gradual / Awakening — Bedroom Unit 01"; this is
 * Gently, so the name is ours and the layout is theirs. The dot on the right
 * means an alarm is set.
 */
export const AppHeader = memo(function AppHeader({ armed }: { armed: boolean }) {
  return (
    <View className="flex-row items-center gap-3 pb-4">
      <View
        className="items-center justify-center rounded-full"
        style={{ width: 34, height: 34, borderWidth: 1, borderColor: colors.line.strong }}>
        <Text style={textStyles.eyebrow} className="text-ink-secondary">
          G
        </Text>
      </View>

      <View className="flex-1">
        <Text style={textStyles.eyebrow} className="text-ink-primary">
          Gently
        </Text>
        <Text style={textStyles.capLabel} className="text-ink-muted">
          Gradual awakening
        </Text>
      </View>

      <View className="rounded-lg px-2 py-1" style={{ borderWidth: 1, borderColor: colors.line.strong }}>
        <Text style={textStyles.capLabel} className="text-ink-secondary">
          24h
        </Text>
      </View>

      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: armed ? colors.accent.base : colors.line.strong,
        }}
      />
    </View>
  );
});
