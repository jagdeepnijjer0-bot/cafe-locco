import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import { useRouter } from 'expo-router';

import { Screen } from '@/components/ui/Screen';
import { Header } from '@/components/ui/Header';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { useAppMenu } from '@/components/AppMenu';
import { useAuthContext } from '@/components/AuthProvider';
import { createCheckoutSession } from '@/lib/stripe';
import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/theme';

const PRICE_DISPLAY = process.env.EXPO_PUBLIC_MEMBERSHIP_PRICE_DISPLAY ?? '£24.00 / month';
const PREMIUM_PRICE_ID = process.env.EXPO_PUBLIC_STRIPE_PREMIUM_PRICE_ID ?? '';

const BENEFITS: { icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { icon: 'cafe-outline', label: 'ONE COMPLIMENTARY COFFEE EVERY MONTH' },
  { icon: 'pricetag-outline', label: 'EXCLUSIVE MEMBER RATES ON THE MENU' },
  { icon: 'calendar-outline', label: 'PRIORITY SEATING AND RESERVATIONS' },
  { icon: 'sparkles-outline', label: 'INVITATIONS TO MEMBER-ONLY EVENTS' },
];

export default function MembershipScreen() {
  const { open } = useAppMenu();
  const router = useRouter();
  const { isLoggedIn } = useAuthContext();
  const [loading, setLoading] = useState(false);

  async function handleBecomeMember() {
    if (!isLoggedIn) {
      router.push('/(auth)/signup');
      return;
    }
    setLoading(true);
    try {
      const session = await createCheckoutSession(PREMIUM_PRICE_ID);
      if (session?.url) {
        await WebBrowser.openBrowserAsync(session.url);
      } else {
        Alert.alert('Membership', 'Checkout is not available right now. Please try again later.');
      }
    } catch {
      Alert.alert('Membership', 'We could not start checkout. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen scroll contentStyle={styles.content}>
      <Header title="MEMBERSHIP" showBack onMenu={open} />

      <View style={styles.intro}>
        <Text variant="title" center style={styles.introTitle}>
          Your Daily Coffee, Perfected
        </Text>
        <Text variant="caption" center tracking={2} style={styles.introSub}>
          JOIN OUR EXCLUSIVE MEMBERSHIP AND ELEVATE EVERY VISIT
        </Text>
      </View>

      {/* Premium membership card */}
      <LinearGradient
        colors={[Colors.goldBorder, Colors.goldBorderSoft, 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardBorder}
      >
        <View style={styles.cardInner}>
          <View style={styles.crownBadge}>
            <Ionicons name="ribbon-outline" size={24} color={Colors.gold} />
          </View>
          <Text variant="heading" center tracking={4} color={Colors.gold}>
            PREMIUM MEMBERSHIP
          </Text>
          <Text variant="display" center style={styles.price}>
            {PRICE_DISPLAY}
          </Text>
          <Text variant="caption" center tracking={2} style={styles.cancelNote}>
            CANCEL ANYTIME • SECURE PAYMENT
          </Text>
        </View>
      </LinearGradient>

      {/* Benefits */}
      <Text variant="heading" center tracking={4} style={styles.benefitsTitle}>
        MEMBERSHIP BENEFITS
      </Text>

      <View style={styles.benefits}>
        {BENEFITS.map((benefit) => (
          <View key={benefit.label} style={styles.benefitRow}>
            <View style={styles.benefitIcon}>
              <Ionicons name={benefit.icon} size={20} color={Colors.gold} />
            </View>
            <Text variant="label" tracking={1} style={styles.benefitLabel}>
              {benefit.label}
            </Text>
          </View>
        ))}
      </View>

      {/* CTAs */}
      <View style={styles.actions}>
        <Button label="BECOME A MEMBER" onPress={handleBecomeMember} loading={loading} />
        <Button
          label="ALREADY A MEMBER? SIGN IN"
          variant="ghost"
          onPress={() => router.push('/(auth)/login')}
        />
      </View>

      <Text variant="caption" center tracking={1} style={styles.terms}>
        BY SUBSCRIBING, YOU AGREE TO OUR TERMS AND PRIVACY POLICY
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },
  intro: { marginTop: Spacing.xl, marginBottom: Spacing.xl, alignItems: 'center' },
  introTitle: { marginBottom: Spacing.md },
  introSub: { maxWidth: 300 },
  cardBorder: {
    borderRadius: Radius.lg,
    padding: 1.5,
    marginBottom: Spacing.xl,
  },
  cardInner: {
    borderRadius: Radius.lg - 1,
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },
  crownBadge: {
    width: 48,
    height: 48,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    backgroundColor: Colors.goldGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  price: { marginTop: Spacing.md, marginBottom: Spacing.sm },
  cancelNote: { marginTop: Spacing.xs },
  benefitsTitle: { marginBottom: Spacing.lg },
  benefits: { gap: Spacing.md, marginBottom: Spacing.xl },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
  },
  benefitIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitLabel: { flex: 1, lineHeight: 18 },
  actions: { gap: Spacing.md, marginBottom: Spacing.lg },
  terms: { maxWidth: 300, alignSelf: 'center' },
});
