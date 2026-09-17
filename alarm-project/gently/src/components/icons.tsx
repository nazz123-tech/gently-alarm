import Svg, { Path, type SvgProps } from 'react-native-svg';

/**
 * The three icons the lock screen needs, with the exact paths from
 * `context/lock-screen-prototype.html`. They are small enough to keep inline
 * rather than pull in an icon library.
 *
 * All of them draw in `currentColor` terms: pass `color` and they follow it.
 */

type IconProps = SvgProps & { size?: number; color?: string };

function Icon({ size = 16, color = '#FFFFFF', children, ...rest }: IconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}>
      {children}
    </Svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Path d="M6 9l6 6 6-6" strokeWidth={2.6} />
    </Icon>
  );
}

export function SpeakerIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Path d="M11 5L6 9H3v6h3l5 4V5z" strokeWidth={2} />
      <Path d="M16 9a4 4 0 010 6" strokeWidth={2} />
    </Icon>
  );
}

export function SpeakerMutedIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Path d="M11 5L6 9H3v6h3l5 4V5z" strokeWidth={2} />
      <Path d="M22 9l-6 6" strokeWidth={2} />
      <Path d="M16 9l6 6" strokeWidth={2} />
    </Icon>
  );
}
