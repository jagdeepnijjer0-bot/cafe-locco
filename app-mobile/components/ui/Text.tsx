import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet, TextStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/theme';

type Variant = 'display' | 'title' | 'heading' | 'body' | 'label' | 'caption';

interface AppTextProps extends RNTextProps {
  variant?: Variant;
  color?: string;
  center?: boolean;
  tracking?: number; // letter-spacing
  style?: TextStyle | TextStyle[];
}

/** Typed text component matching the genuine Cafe Locco type scale. */
export function Text({
  variant = 'body',
  color,
  center,
  tracking,
  style,
  ...rest
}: AppTextProps) {
  return (
    <RNText
      {...rest}
      style={[
        styles[variant],
        color ? { color } : null,
        center ? { textAlign: 'center' } : null,
        tracking != null ? { letterSpacing: tracking } : null,
        style,
      ]}
    />
  );
}

// All Helvetica Neue (matches cafelocco.com). Headings are uppercase + letter-spaced.
const styles = StyleSheet.create({
  display: { fontFamily: Fonts.family, fontWeight: '700', fontSize: 26, color: Colors.textPrimary, letterSpacing: 2 },
  title: { fontFamily: Fonts.family, fontWeight: '600', fontSize: 20, color: Colors.textPrimary, letterSpacing: 1.5 },
  heading: { fontFamily: Fonts.family, fontWeight: '600', fontSize: 14, color: Colors.textPrimary, letterSpacing: 3 },
  body: { fontFamily: Fonts.family, fontWeight: '400', fontSize: 15, color: Colors.textSecondary, lineHeight: 23 },
  label: { fontFamily: Fonts.family, fontWeight: '500', fontSize: 13, color: Colors.textPrimary, letterSpacing: 2 },
  caption: { fontFamily: Fonts.family, fontWeight: '400', fontSize: 12, color: Colors.textMuted, letterSpacing: 1 },
});
