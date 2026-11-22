import type { ReactNode } from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

/**
 * Line icons. Globe, Sun, Moon, Flag, MapPin, Server and Resolvers are copied from the site's
 * markup; the rest are Lucide icons for controls the site doesn't have.
 */

export type IconProps = { color: string; size?: number; strokeWidth?: number };

function Icon({
  color,
  size = 18,
  strokeWidth = 1.8,
  children,
}: IconProps & { children: ReactNode }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round">
      {children}
    </Svg>
  );
}

export function GlobeIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Circle cx="12" cy="12" r="9" />
      <Path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </Icon>
  );
}

export function SunIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Circle cx="12" cy="12" r="4" />
      <Path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </Icon>
  );
}

export function MoonIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
    </Icon>
  );
}

export function FlagIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7" />
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

export function ServerIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Rect x="2" y="3" width="20" height="7" rx="2" />
      <Rect x="2" y="14" width="20" height="7" rx="2" />
      <Path d="M6 6.5h.01M6 17.5h.01" />
    </Icon>
  );
}

/** The site's "DNS resolvers" icon. */
export function ResolversIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Path d="M12 3a15 15 0 0 1 4 9 15 15 0 0 1-4 9 15 15 0 0 1-4-9 15 15 0 0 1 4-9z" />
      <Circle cx="12" cy="12" r="9" />
    </Icon>
  );
}

export function AlertIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Circle cx="12" cy="12" r="9" />
      <Path d="M12 8v4M12 16h.01" />
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
      <Path d="M18 6 6 18M6 6l12 12" />
    </Icon>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Path d="m12 19-7-7 7-7M19 12H5" />
    </Icon>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Circle cx="12" cy="12" r="9" />
      <Path d="M12 7v5l3 2" />
    </Icon>
  );
}

export function CopyIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Rect width="13" height="13" x="9" y="9" rx="2" />
      <Path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </Icon>
  );
}
