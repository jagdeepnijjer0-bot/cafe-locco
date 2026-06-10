import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Screen } from '@/components/ui/Screen';
import { Colors } from '@/constants/colors';
import { useAppMenu } from '@/components/AppMenu';

const logo = require('@/assets/images/logo.png');

/** Home — genuine Figma: black screen, centered Cafe Locco logo, hamburger menu. */
export default function HomeScreen() {
  const { open } = useAppMenu();

  return (
    <Screen backgroundColor="#000">
      <View style={styles.header}>
        <View style={styles.spacer} />
        <Pressable onPress={open} hitSlop={12} style={styles.menuBtn}>
          <Ionicons name="menu" size={28} color={Colors.white} />
        </Pressable>
      </View>

      <View style={styles.center}>
        <Image source={logo} style={styles.logo} contentFit="contain" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  spacer: { width: 40, height: 40 },
  menuBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 },
  logo: { width: 260, height: 260 },
});
