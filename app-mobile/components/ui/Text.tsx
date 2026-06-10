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

const styles = StyleSheet.create({
  display: { fontFamily: Fonts.serifBold, fontSize: 40, color: Colors.textPrimary, letterSpacing: 1 },
  title: { fontFamily: Fonts.serif, fontSize: 28, color: Colors.textPrimary, letterSpacing: 1 },
  heading: { fontFamily: Fonts.bodySemiBold, fontSize: 14, color: Colors.textPrimary, letterSpacing: 3 },
  body: { fontFamily: Fonts.body, fontSize: 15, color: Colors.textSecondary, lineHeight: 22 },
  label: { fontFamily: Fonts.bodyMedium, fontSize: 13, color: Colors.textPrimary, letterSpacing: 2 },
  caption: { fontFamily: Fonts.body, fontSize: 12, color: Colors.textMuted, letterSpacing: 1 },
});
