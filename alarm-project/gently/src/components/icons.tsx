import Svg, { Path, type SvgProps } from 'react-native-svg';

/**
 * Inline icons, small enough to keep here rather than pull in an icon library.
 * Pass `color` and the icon follows it.
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

export function MoonIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Path d="M20 14.5A8.5 8.5 0 019.5 4a8.5 8.5 0 1010.5 10.5z" strokeWidth={1.6} />
    </Icon>
  );
}

