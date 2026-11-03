import React, { useCallback, useRef, useState } from 'react';
import { View, StyleSheet, Pressable, ActivityIndicator, Alert } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect, Href } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';

import { Screen } from '@/components/ui/Screen';
import { Header } from '@/components/ui/Header';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { useAppMenu, useReturnToMenuOnBack } from '@/components/AppMenu';
import { useAuthContext } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/colors';
import { Fonts, Spacing, Radius } from '@/constants/theme';

const bag = require('@/assets/images/locco-beans-bag.jpg');
const logo = require('@/assets/images/logo-transparent.png');

// Display-only amounts. The SERVER sets the real price; the app sends only { quantity }.
const UNIT_PRICE_PENCE = 999;
const DELIVERY_PENCE = 375;
const MIN_QTY = 1;
const MAX_QTY = 5;

function gbp(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`;
}

/** Shop: signed out shows the sign-in/up prompt; signed in shows the product. */
export default function ShopScreen() {
  const { open } = useAppMenu();
  useReturnToMenuOnBack();
  const { isLoggedIn, loading } = useAuthContext();

  if (loading) {
    return (
      <Screen>
        <Header title="Shop" showBack onMenu={open} />
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={Colors.gold} />
        </View>
      </Screen>
    );
  }

  return isLoggedIn ? <SignedIn open={open} /> : <SignedOut open={open} />;
}

/* ------------------------------------------------------------------ */
/* Signed out                                                          */
/* ------------------------------------------------------------------ */
function SignedOut({ open }: { open: () => void }) {
  const router = useRouter();
  return (
    <Screen scroll contentStyle={styles.content}>
      <Header title="Shop" showBack onMenu={open} />

      <View style={styles.logoWrap}>
        <Image source={logo} style={styles.logo} contentFit="contain" />
      </View>

      <Text style={styles.signedOutTitle}>Sign in to shop</Text>
      <Text style={styles.signedOutBody}>
        Use your Cafe Locco account, the same one as Rewards. We will email your order confirmation
        to you.
      </Text>

      <Button label="SIGN IN" onPress={() => router.push('/(auth)/login')} style={styles.cta} />
      <Button
        label="CREATE ACCOUNT"
        variant="outline"
        onPress={() => router.push('/(auth)/signup')}
        style={styles.ctaSecondary}
      />
    </Screen>
  );
}

/* ------------------------------------------------------------------ */
/* Signed in                                                          */
/* ------------------------------------------------------------------ */
function SignedIn({ open }: { open: () => void }) {
  const { user, profile } = useAuthContext();
  const router = useRouter();
  const [qty, setQty] = useState(MIN_QTY);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // True only while this screen is the focused route. Opening the in-app
  // browser does not blur it, but the cafelocco://shop-success deep link
  // navigating away does, and so does unmounting. We read this before every
  // navigation so we never double-navigate or set state on a dead screen.
  const focusedRef = useRef(true);
  useFocusEffect(
    useCallback(() => {
      focusedRef.current = true;
      return () => {
        focusedRef.current = false;
      };
    }, []),
  );

  const email = user?.email ?? profile?.email ?? '';
  const itemTotal = UNIT_PRICE_PENCE * qty;
  const total = itemTotal + DELIVERY_PENCE;

  // After the browser closes, the webhook writes the order a moment later. Poll
  // the user's own rows (RLS own-read) for the newest one created since this
  // checkout began. Returns the Stripe session id of that order, or null.
  const pollForOrder = useCallback(
    async (startedAt: Date): Promise<string | null> => {
      const sinceIso = new Date(startedAt.getTime() - 60_000).toISOString();
      const MAX_ATTEMPTS = 7; // ~10s total at 1.5s intervals
      for (let i = 0; i < MAX_ATTEMPTS; i += 1) {
        // Stop if we unmounted or the deep link already moved us to success.
        if (!focusedRef.current || !user?.id) return null;
        const { data } = await supabase
          .from('shop_orders')
          .select('order_ref, stripe_session_id')
          .eq('user_id', user.id)
          .gte('created_at', sinceIso)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (!focusedRef.current) return null;
        const sessionId = (data as { stripe_session_id?: string } | null)?.stripe_session_id;
        if (sessionId) return sessionId;
        if (i < MAX_ATTEMPTS - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }
      }
      return null;
    },
    [user?.id],
  );

  async function handleCheckout() {
    if (checkoutLoading) return;
    setCheckoutLoading(true);
    setNotice(null);
    const startedAt = new Date();
    try {
      const { data, error } = await supabase.functions.invoke('create-shop-checkout', {
        body: { quantity: qty },
      });
      if (error) throw error;
      const url = (data as { url?: string } | null)?.url;
      if (!url) throw new Error('No checkout URL returned');
      await WebBrowser.openBrowserAsync(url);
      // Browser dismissed. If the deep link already took us to the success
      // screen, focusedRef is false and polling exits without navigating.
      const sessionId = await pollForOrder(startedAt);
      if (sessionId && focusedRef.current) {
        setCheckoutLoading(false);
        router.replace(
          `/shop-success?session_id=${encodeURIComponent(sessionId)}` as Href,
        );
        return;
      }
      if (focusedRef.current) {
        setNotice('If you completed payment, your confirmation will arrive by email shortly.');
      }
    } catch {
      if (focusedRef.current) {
        Alert.alert('Checkout', 'We could not start checkout. Please try again in a moment.');
      }
    } finally {
      if (focusedRef.current) setCheckoutLoading(false);
    }
  }

  return (
    <Screen scroll contentStyle={styles.content}>
      <Header title="Shop" showBack onMenu={open} />

      {/* Product card */}
      <View style={styles.productCard}>
        <Image source={bag} style={styles.productImage} contentFit="cover" transition={150} />
        <View style={styles.productBody}>
          <View style={styles.titleRow}>
            <Text style={styles.productTitle}>Locco Coffee Beans</Text>
            <Text style={styles.productPrice}>{gbp(UNIT_PRICE_PENCE)}</Text>
          </View>
          <Text style={styles.productDesc}>
            250g bag of our house beans. Delivered to your door in the UK.
          </Text>
        </View>
      </View>

      {/* Quantity */}
      <View style={styles.qtyRow}>
        <Text style={styles.qtyLabel}>QUANTITY</Text>
        <View style={styles.stepper}>
          <Pressable
            onPress={() => setQty((q) => Math.max(MIN_QTY, q - 1))}
            disabled={qty <= MIN_QTY}
            style={[styles.stepBtn, qty <= MIN_QTY && styles.stepBtnDisabled]}
            hitSlop={6}
          >
            <Ionicons name="remove" size={22} color={Colors.textPrimary} />
          </Pressable>
          <Text style={styles.qtyValue}>{qty}</Text>
          <Pressable
            onPress={() => setQty((q) => Math.min(MAX_QTY, q + 1))}
            disabled={qty >= MAX_QTY}
            style={[styles.stepBtn, qty >= MAX_QTY && styles.stepBtnDisabled]}
            hitSlop={6}
          >
            <Ionicons name="add" size={22} color={Colors.textPrimary} />
          </Pressable>
        </View>
      </View>

      {/* Summary */}
      <View style={styles.summaryCard}>
        <View style={styles.sumRow}>
          <Text style={styles.sumLabel}>Locco Coffee Beans, 250g x {qty}</Text>
          <Text style={styles.sumValue}>{gbp(itemTotal)}</Text>
        </View>
        <View style={styles.sumRow}>
          <Text style={styles.sumLabel}>UK delivery (Royal Mail Tracked 48)</Text>
          <Text style={styles.sumValue}>{gbp(DELIVERY_PENCE)}</Text>
        </View>
        <View style={styles.sumDivider} />
        <View style={styles.sumRow}>
          <Text style={styles.sumTotalLabel}>Total</Text>
          <Text style={styles.sumTotalValue}>{gbp(total)}</Text>
        </View>
      </View>

      <Button
        label={`CHECKOUT - GBP ${(total / 100).toFixed(2)}`}
        onPress={handleCheckout}
        loading={checkoutLoading}
        style={styles.checkoutBtn}
      />

      {notice ? (
        <View style={styles.noticeBox}>
          <Text style={styles.noticeText}>{notice}</Text>
        </View>
      ) : null}

      <Text style={styles.payCaption}>
        Secure payment by Stripe. Card, Apple Pay or Google Pay. UK delivery only.
      </Text>
      {email ? (
        <Text style={styles.emailCaption}>Confirmation will be sent to {email}</Text>
      ) : null}
    </Screen>
  );
}

const FONT = Fonts.family;

const styles = StyleSheet.create({
  content: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Signed out
  logoWrap: { alignItems: 'center', marginTop: Spacing.xl, marginBottom: Spacing.lg },
  logo: { width: 120, height: 120 },
  signedOutTitle: {
    fontFamily: FONT, fontWeight: '700', fontSize: 20, letterSpacing: 1,
    color: Colors.white, textAlign: 'center', marginBottom: Spacing.md,
  },
  signedOutBody: {
    fontFamily: FONT, fontWeight: '300', fontSize: 14, lineHeight: 22,
    color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.xl, maxWidth: 320, alignSelf: 'center',
  },
  cta: { marginBottom: Spacing.md },
  ctaSecondary: {},

  // Product card
  productCard: {
    marginTop: Spacing.lg,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    marginBottom: Spacing.xl,
  },
  productImage: { width: '100%', height: 230 },
  productBody: { padding: Spacing.lg },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.md },
  productTitle: { fontFamily: FONT, fontWeight: '600', fontSize: 18, letterSpacing: 0.5, color: Colors.white, flex: 1 },
  productPrice: { fontFamily: FONT, fontWeight: '700', fontSize: 18, color: Colors.gold },
  productDesc: { fontFamily: FONT, fontWeight: '300', fontSize: 13.5, lineHeight: 21, color: Colors.textSecondary, marginTop: Spacing.sm },

  // Quantity
  qtyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.lg },
  qtyLabel: { fontFamily: FONT, fontWeight: '600', fontSize: 12, letterSpacing: 2, color: Colors.textSecondary },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  stepBtn: {
    width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, borderColor: Colors.goldBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  stepBtnDisabled: { opacity: 0.35 },
  qtyValue: { fontFamily: FONT, fontWeight: '700', fontSize: 20, color: Colors.white, minWidth: 24, textAlign: 'center' },

  // Summary
  summaryCard: {
    borderRadius: Radius.lg, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    padding: Spacing.lg, marginBottom: Spacing.xl,
  },
  sumRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
  sumLabel: { fontFamily: FONT, fontWeight: '400', fontSize: 13.5, color: Colors.textSecondary, flex: 1, marginRight: Spacing.md },
  sumValue: { fontFamily: FONT, fontWeight: '500', fontSize: 14, color: Colors.white },
  sumDivider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.sm },
  sumTotalLabel: { fontFamily: FONT, fontWeight: '700', fontSize: 15, letterSpacing: 1, color: Colors.white },
  sumTotalValue: { fontFamily: FONT, fontWeight: '700', fontSize: 18, color: Colors.gold },

  checkoutBtn: { marginBottom: Spacing.md },
  noticeBox: {
    borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.goldBorder,
    backgroundColor: Colors.surface, paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  noticeText: {
    fontFamily: FONT, fontWeight: '400', fontSize: 13, lineHeight: 19, letterSpacing: 0.2,
    color: Colors.gold, textAlign: 'center',
  },
  payCaption: {
    fontFamily: FONT, fontWeight: '400', fontSize: 11.5, lineHeight: 17, letterSpacing: 0.3,
    color: Colors.textMuted, textAlign: 'center', maxWidth: 320, alignSelf: 'center',
  },
  emailCaption: {
    fontFamily: FONT, fontWeight: '400', fontSize: 11.5, letterSpacing: 0.3,
    color: Colors.textMuted, textAlign: 'center', marginTop: Spacing.sm,
  },
});
