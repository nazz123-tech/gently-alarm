import { memo, useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { formatDateLine } from '@/lib/schedule';
import { colors, textStyles } from '@/theme';

/**
 * Today's date and the time right now, the first thing you see on the page.
 *
 * The seconds sit next to "a gentle start" rather than in the clock itself, so
 * the big digits only change once a minute and the page stays still.
 *
 * The once-a-second timer lives here rather than on the page. This is the only
 * thing that shows seconds, and when the page owned the timer the whole thing
 * re-rendered sixty times a minute — including the schedule and the countdown,
 * which between them build fifteen date objects each pass.
 */
export const NowBlock = memo(function NowBlock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return (
    <View className="border-t border-line-soft pb-6 pt-5">
      <View className="flex-row items-center justify-between">
        <Text style={textStyles.eyebrow} className="text-ink-muted">
          {formatDateLine(now)}
        </Text>
        <Text style={textStyles.capLabel} className="text-ink-muted">
          Local
        </Text>
      </View>

      <Text style={textStyles.display} className="mt-4 text-ink-primary">
        {hours}:{minutes}
      </Text>

      <View className="mt-3 flex-row items-center gap-3">
        <View style={{ width: 28, height: 1, backgroundColor: colors.accent.base }} />
        <Text style={textStyles.capLabel} className="text-accent-base">
          A gentle start
        </Text>
        <Text style={textStyles.capLabel} className="text-ink-muted">
          :{seconds}
        </Text>
      </View>
    </View>
  );
});
