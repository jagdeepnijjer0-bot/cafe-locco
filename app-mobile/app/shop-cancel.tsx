import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Href } from 'expo-router';

import { Screen } from '@/components/ui/Screen';
import { Header } from '@/components/ui/Header';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { useAppMenu, useReturnToMenuOnBack } from '@/components/AppMenu';
import { Colors } from '@/constants/colors';
import { Fonts, Spacing } from '@/constants/theme';

export default function ShopCancelScreen() {
  const { open } = useAppMenu();
  useReturnToMenuOnBack();
  const router = useRouter();

  return (
    <Screen scroll contentStyle={styles.content}>
      <Header showBack onMenu={open} />

      <View style={styles.icon}>
        <Ionicons name="bag-handle-outline" size={34} color={Colors.textMuted} />
      </View>

      <Text style={styles.title}>Checkout cancelled</Text>
      <Text style={styles.sub}>You have not been charged.</Text>

      <Button label="BACK TO SHOP" onPress={() => router.replace('/shop' as Href)} style={styles.btn} />
    </Screen>
  );
}

const FONT = Fonts.family;

const styles = StyleSheet.create({
  content: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl, alignItems: 'center' },
  icon: {
    width: 72, height: 72, borderRadius: 36, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center', marginTop: Spacing.xxl, marginBottom: Spacing.lg,
  },
  title: {
    fontFamily: FONT, fontWeight: '700', fontSize: 20, letterSpacing: 0.5,
    color: Colors.white, textAlign: 'center', marginBottom: Spacing.sm,
  },
  sub: {
    fontFamily: FONT, fontWeight: '300', fontSize: 14, color: Colors.textSecondary,
    textAlign: 'center', marginBottom: Spacing.xl,
  },
  btn: { alignSelf: 'stretch' },
});
