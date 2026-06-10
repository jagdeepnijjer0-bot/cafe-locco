import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Text } from './Text';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  center?: boolean;
}

/** Uppercase letter-spaced heading with a gold underline rule (genuine Figma motif). */
export function SectionHeader({ title, subtitle, center = true }: SectionHeaderProps) {
  return (
    <View style={[styles.wrap, center && styles.center]}>
      <Text variant="heading" tracking={4} center={center}>
        {title.toUpperCase()}
      </Text>
      <View style={[styles.rule, center && styles.ruleCenter]} />
      {subtitle ? (
        <Text variant="body" center={center} style={styles.subtitle}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 24 },
  center: { alignItems: 'center' },
  rule: { width: 48, height: 1.5, backgroundColor: Colors.gold, marginTop: 12 },
  ruleCenter: { alignSelf: 'center' },
  subtitle: { marginTop: 12, maxWidth: 320 },
});
