import * as React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

export type LogoProps = {
  size?: number;
  testID?: string;
  className?: string;
};

export function Logo({
  size = 48,
  testID = 'auth-logo',
  className,
}: LogoProps) {
  return (
    <Svg
      testID={testID}
      accessibilityRole="image"
      accessibilityLabel="Ledger Keeper"
      width={size}
      height={size}
      viewBox="0 0 512 512"
      className={className}
    >
      <Path d="M88 108a52 52 0 0 1 52-52h116v400H140a52 52 0 0 1-52-52z" fill="#4285F4" />
      <Path d="M256 56h116a52 52 0 0 1 52 52v296a52 52 0 0 1-52 52H256z" fill="#34A853" />
      <Path d="M256 56h24v400h-24z" fill="#1E8E3E" />
      <Path d="M232 56h24v400h-24z" fill="#1A73E8" />
      <Rect x="304" y="262" width="88" height="24" rx={12} fill="#fff" opacity={0.9} />
      <Rect x="304" y="314" width="64" height="24" rx={12} fill="#fff" opacity={0.65} />
      <Rect x="304" y="366" width="40" height="24" rx={12} fill="#fff" opacity={0.4} />
      <Path d="M320 56h64v168l-32-28-32 28z" fill="#EA4335" />
      <Path d="M164 188c6 44 26 64 70 70-44 6-64 26-70 70-6-44-26-64-70-70 44-6 64-26 70-70z" fill="#FBBC04" />
    </Svg>
  );
}
