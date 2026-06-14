import React from 'react';
import { Pressable, StyleSheet, ActivityIndicator, View, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/colors';
import { Radius } from '../../constants/theme';
import { Text } from './Text';

type Variant = 'primary' | 'outline' | 'ghost';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

/** Pill button — muted premium gold: gold outline + gold label on black
 *  (no bright solid fill), matching the toned-down website branding. */
export function Button({
  label,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  fullWidth = true,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const handlePress = () => {
    if (isDisabled) return;
    Haptics.selectionAsync().catch(() => {});
    onPress?.();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'outline' && styles.outline,
        variant === 'ghost' && styles.ghost,
        fullWidth && styles.fullWidth,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={Colors.gold} />
      ) : (
        <View style={styles.row}>
          <Text
            variant="label"
            tracking={2}
            color={variant === 'ghost' ? Colors.textSecondary : Colors.gold}
          >
            {label.toUpperCase()}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 54,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  // Primary CTA: black/dark fill with a gold outline + gold label (no gold fill).
  primary: { backgroundColor: '#0E0E0E', borderWidth: 1.5, borderColor: Colors.gold },
  outline: { borderWidth: 1, borderColor: Colors.goldBorder, backgroundColor: 'transparent' },
  ghost: { backgroundColor: 'transparent' },
  fullWidth: { alignSelf: 'stretch' },
  pressed: { opacity: 0.7, backgroundColor: Colors.surfaceElevated },
  disabled: { opacity: 0.4 },
});
