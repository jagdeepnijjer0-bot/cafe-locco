import React, { useState } from 'react';
import { View, StyleSheet, Alert, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

import { Screen } from '@/components/ui/Screen';
import { Header } from '@/components/ui/Header';
import { Text } from '@/components/ui/Text';
import { useAppMenu } from '@/components/AppMenu';
import { useAuthContext } from '@/components/AuthProvider';
import { createCheckoutSession } from '@/lib/stripe';
import { Colors } from '@/constants/colors';
import { Fonts, Spacing, Radius } from '@/constants/theme';

const PRICE_RAW = process.env.EXPO_PUBLIC_MEMBERSHIP_PRICE_DISPLAY ?? '£19.99 / month';
const PRICE_AMOUNT = PRICE_RAW.split('/')[0].trim(); // "£19.99"
const PREMIUM_PRICE_ID = process.env.EXPO_PUBLIC_STRIPE_PREMIUM_PRICE_ID ?? '';

// Gold-bordered content boxes (matches the Our Story theme).
const BORDER = Colors.goldBorder;

export default function MembershipScreen() {
  const { open } = useAppMenu();
  const router = useRouter();
  const { isLoggedIn } = useAuthContext();
  const [loading, setLoading] = useState(false);

  async function handleSubscribe() {
    Haptics.selectionAsync().catch(() => {});
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
    <Screen scroll contentStyle={styles.content} backgroundColor="#000">
      <Header title="PREMIUM SUBSCRIPTION" showBack onMenu={open} />

      {/* Value proposition */}
      <View style={styles.intro}>
        <Text style={styles.valueTitle}>YOUR DAILY COFFEE</Text>
        <Text style={styles.valueTitle}>PERFECTED</Text>
        <Text style={styles.valueSub}>
          JOIN OUR EXCLUSIVE MEMBERSHIP AND ELEVATE YOUR COFFEE EXPERIENCE
        </Text>
      </View>

      {/* Price */}
      <View style={styles.priceCard}>
        <Text style={styles.priceAmount}>{PRICE_AMOUNT}</Text>
        <Text style={styles.pricePeriod}>PER MONTH</Text>
      </View>

      {/* Benefits */}
      <Text style={styles.benefitsTitle}>MEMBERSHIP BENEFITS</Text>
      <View style={styles.rule} />

      <View style={styles.benefitCard}>
        <View style={styles.benefitIcon}>
          <Ionicons name="cafe-outline" size={24} color={Colors.white} />
        </View>
        <Text style={styles.benefitLabel}>1 FREE PREMIUM COFFEE DAILY</Text>
      </View>

      <View style={styles.benefitCard}>
        <View style={styles.benefitIcon}>
          <Ionicons name="calendar-outline" size={24} color={Colors.white} />
        </View>
        <Text style={styles.benefitLabel}>7 DAYS A WEEK, EVERY DAY</Text>
      </View>

      <View style={styles.benefitCard}>
        <View style={styles.benefitIcon}>
          <MaterialCommunityIcons name="crown-outline" size={26} color={Colors.white} />
        </View>
        <Text style={styles.benefitLabel}>EXCLUSIVE MEMBER PERKS</Text>
      </View>

      {/* CTAs — dark styling, no gold/yellow fill */}
      <Pressable
        onPress={handleSubscribe}
        disabled={loading}
        style={({ pressed }) => [styles.ctaPrimary, pressed && styles.pressed]}
      >
        {loading ? (
          <ActivityIndicator color={Colors.gold} />
        ) : (
          <Text style={styles.ctaPrimaryText}>SIGN UP AND SUBSCRIBE</Text>
        )}
      </Pressable>

      <Pressable
        onPress={() => router.push('/(auth)/login')}
        style={({ pressed }) => [styles.ctaSecondary, pressed && styles.pressed]}
      >
        <Text style={styles.ctaSecondaryText}>ALREADY A MEMBER - LOG IN</Text>
      </Pressable>

      {/* Trust */}
      <Text style={styles.trust}>CANCEL ANYTIME • SECURE PAYMENT</Text>
      <Text style={styles.terms}>BY SUBSCRIBING, YOU AGREE TO OUR TERMS AND PRIVACY POLICY</Text>
    </Screen>
  );
}

const FONT = Fonts.family;

const styles = StyleSheet.create({
  content: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },

  intro: { alignItems: 'center', paddingVertical: Spacing.xl },
  valueTitle: {
    fontFamily: FONT,
    fontWeight: '500',
    fontSize: 24,
    letterSpacing: 1.5,
    color: Colors.white,
    textAlign: 'center',
  },
  valueSub: {
    fontFamily: FONT,
    fontWeight: '400',
    fontSize: 11,
    letterSpacing: 2,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    marginTop: Spacing.lg,
    maxWidth: 280,
  },

  priceCard: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 28,
    paddingVertical: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  priceAmount: {
    fontFamily: FONT,
    fontWeight: '600',
    fontSize: 40,
    lineHeight: 52,
    letterSpacing: 2,
    color: Colors.white,
    textAlign: 'center',
    paddingTop: 4,
    marginBottom: 6,
  },
  pricePeriod: {
    fontFamily: FONT,
    fontWeight: '400',
    fontSize: 11,
    letterSpacing: 2,
    color: 'rgba(255,255,255,0.6)',
  },

  benefitsTitle: {
    fontFamily: FONT,
    fontWeight: '600',
    fontSize: 12,
    letterSpacing: 3,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  // gold accent line under the heading (matches Our Story)
  rule: { width: 44, height: 1.5, backgroundColor: Colors.gold, alignSelf: 'center', marginBottom: Spacing.lg },
  benefitCard: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 28,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  benefitIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  benefitLabel: {
    fontFamily: FONT,
    fontWeight: '500',
    fontSize: 12,
    letterSpacing: 1,
    color: Colors.white,
    textAlign: 'center',
  },

  ctaPrimary: {
    height: 56,
    borderRadius: Radius.pill,
    // Match the shared Button primary (Send Message / Confirm Reservation):
    // dark fill, 1.5 gold outline, gold label.
    backgroundColor: '#0E0E0E',
    borderWidth: 1.5,
    borderColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xl,
  },
  ctaPrimaryText: {
    fontFamily: FONT,
    fontWeight: '600',
    fontSize: 12,
    letterSpacing: 2,
    color: Colors.gold,
  },
  ctaSecondary: {
    height: 52,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
  },
  ctaSecondaryText: {
    fontFamily: FONT,
    fontWeight: '400',
    fontSize: 12,
    letterSpacing: 2,
    color: Colors.white,
  },
  pressed: { opacity: 0.7 },

  trust: {
    fontFamily: FONT,
    fontWeight: '400',
    fontSize: 11,
    letterSpacing: 1,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
  terms: {
    fontFamily: FONT,
    fontWeight: '400',
    fontSize: 10,
    letterSpacing: 1,
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'center',
    marginTop: Spacing.md,
    maxWidth: 300,
    alignSelf: 'center',
  },
});
