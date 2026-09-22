import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type IconName =
  | 'home'
  | 'calendar'
  | 'navigation'
  | 'user'
  | 'pin'
  | 'search';

type Props = { name: IconName; size?: number; color?: string };

// Feather-style 24x24 stroke icons.
export function Icon({ name, size = 24, color = '#1A1A1A' }: Props) {
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
      {name === 'home' && (
        <>
          <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <Path d="M9 22V12h6v10" />
        </>
      )}
      {name === 'calendar' && (
        <>
          <Rect x={3} y={4} width={18} height={18} rx={2} />
          <Path d="M16 2v4M8 2v4M3 10h18" />
        </>
      )}
      {name === 'navigation' && <Path d="M3 11l19-9-9 19-2-8-8-2z" />}
      {name === 'user' && (
        <>
          <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <Circle cx={12} cy={7} r={4} />
        </>
      )}
      {name === 'pin' && (
        <>
          <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <Circle cx={12} cy={10} r={3} />
        </>
      )}
      {name === 'search' && (
        <>
          <Circle cx={11} cy={11} r={8} />
          <Path d="M21 21l-4.35-4.35" />
        </>
      )}
    </Svg>
  );
}
