import { IconButton } from '@/components/IconButton';
import { SpeakerIcon, SpeakerMutedIcon } from '@/components/icons';
import { colors } from '@/theme';

type MuteButtonProps = {
  muted: boolean;
  onPress: () => void;
};

/** Mutes the soundscape without stopping the alarm. */
export function MuteButton({ muted, onPress }: MuteButtonProps) {
  const Icon = muted ? SpeakerMutedIcon : SpeakerIcon;

  return (
    <IconButton
      off={muted}
      onPress={onPress}
      accessibilityLabel={muted ? 'Unmute soundscape' : 'Mute soundscape'}>
      <Icon size={15} color={muted ? 'rgba(255,255,255,0.5)' : colors.onSky.text} />
    </IconButton>
  );
}
