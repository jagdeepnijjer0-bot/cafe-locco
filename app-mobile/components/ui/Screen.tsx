import React from 'react';
import { View, StyleSheet, ScrollView, ViewStyle } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../../constants/colors';

interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  edges?: Edge[];
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  backgroundColor?: string;
}

/** Black, dark-hospitality screen wrapper used across every Cafe Locco screen. */
export function Screen({
  children,
  scroll = false,
  edges = ['top', 'bottom'],
  style,
  contentStyle,
  backgroundColor = Colors.background,
}: ScreenProps) {
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor }, style]} edges={edges}>
      <StatusBar style="light" />
      {scroll ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.scrollContent, contentStyle]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flex, contentStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1 },
});
