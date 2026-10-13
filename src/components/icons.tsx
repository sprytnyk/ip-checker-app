import type { ReactNode } from 'react';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

/**
 * Lucide icons. Hash, Flag, MapPin and Building2 are copied from the site's markup;
 * the rest are for controls the site doesn't have.
 */

type IconProps = { color: string; size?: number };

function Icon({ color, size = 24, children }: IconProps & { children: ReactNode }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round">
      {children}
    </Svg>
  );
}

export function HashIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Line x1="4" x2="20" y1="9" y2="9" />
      <Line x1="4" x2="20" y1="15" y2="15" />
      <Line x1="10" x2="8" y1="3" y2="21" />
      <Line x1="16" x2="14" y1="3" y2="21" />
    </Icon>
  );
}

export function FlagIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <Line x1="4" x2="4" y1="22" y2="15" />
    </Icon>
  );
}

export function MapPinIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <Circle cx="12" cy="10" r="3" />
    </Icon>
  );
}

export function BuildingIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <Path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <Path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
      <Path d="M10 6h4" />
      <Path d="M10 10h4" />
      <Path d="M10 14h4" />
      <Path d="M10 18h4" />
    </Icon>
  );
}

export function AlertIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Circle cx="12" cy="12" r="10" />
      <Line x1="12" x2="12" y1="8" y2="12" />
      <Line x1="12" x2="12.01" y1="16" y2="16" />
    </Icon>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Circle cx="11" cy="11" r="8" />
      <Path d="m21 21-4.3-4.3" />
    </Icon>
  );
}

export function XIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Path d="M18 6 6 18" />
      <Path d="m6 6 12 12" />
    </Icon>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Path d="m12 19-7-7 7-7" />
      <Path d="M19 12H5" />
    </Icon>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Circle cx="12" cy="12" r="10" />
      <Path d="M12 6v6l4 2" />
    </Icon>
  );
}

export function CopyIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <Path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </Icon>
  );
}
