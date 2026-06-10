import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { Colors } from '../../constants/colors';
import { Fonts, Radius } from '../../constants/theme';
import { Text } from './Text';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

/** Dark, gold-focus text field matching the genuine auth/contact forms. */
export function Input({ label, error, style, ...rest }: InputProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.wrap}>
      {label ? (
        <Text variant="caption" tracking={2} color={Colors.textSecondary} style={styles.label}>
          {label.toUpperCase()}
        </Text>
      ) : null}
      <TextInput
        placeholderTextColor={Colors.textMuted}
        selectionColor={Colors.gold}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[
          styles.input,
          focused && styles.inputFocused,
          !!error && styles.inputError,
          style,
        ]}
        {...rest}
      />
      {error ? (
        <Text variant="caption" color={Colors.error} style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  label: { marginBottom: 8 },
  input: {
    height: 52,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    color: Colors.textPrimary,
    fontFamily: Fonts.body,
    fontSize: 15,
  },
  inputFocused: { borderColor: Colors.gold },
  inputError: { borderColor: Colors.error },
  error: { marginTop: 6 },
});
