import type { ReactNode } from 'react';
import { View } from 'react-native';

import { colors } from '@/theme';

/**
 * A pane of dark glass on the sky, holding one section of the app page.
 *
 * The page sits on the same night sky as the lock screen, and it scrolls past
 * the bright band of the horizon. Text straight on the sky would vanish there,
 * so each section carries its own darkened backing — dark enough to read
 * against the horizon, clear enough that the sky still shows through.
 */
export function Card({ children }: { children: ReactNode }) {
  return (
    <View
      className="mb-3 rounded-3xl px-4 pb-2"
      style={{
        backgroundColor: colors.onSky.card,
        borderWidth: 1,
        borderColor: colors.onSky.line,
      }}>
      {children}
    </View>
  );
}
