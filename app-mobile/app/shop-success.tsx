import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, Href } from 'expo-router';

import { Screen } from '@/components/ui/Screen';
import { Header } from '@/components/ui/Header';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { useAppMenu, useReturnToMenuOnBack } from '@/components/AppMenu';
import { useAuthContext } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/colors';
import { Fonts, Spacing, Radius } from '@/constants/theme';

interface ShopOrder {
  order_ref: string;
  quantity: number | null;
  total_pence: number | null;
}

function gbp(pence: number | null): string {
  return `£${((typeof pence === 'number' ? pence : 0) / 100).toFixed(2)}`;
}

function firstParam(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return v[0] ?? '';
  return v ?? '';
}

// The webhook creates the order a moment after payment, so poll shop_orders by
// stripe_session_id for ~10s (RLS lets the user read their own order).
export default function ShopSuccessScreen() {
  const { open } = useAppMenu();
  useReturnToMenuOnBack();
  const router = useRouter();
  const params = useLocalSearchParams();
  const sessionId = firstParam(params.session_id);
  const { user, profile } = useAuthContext();
  const email = user?.email ?? profile?.email ?? '';

  const [order, setOrder] = useState<ShopOrder | null>(null);
  const [status, setStatus] = useState<'loading' | 'found' | 'pending'>('loading');

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let attempts = 0;
    const MAX_ATTEMPTS = 7; // ~10.5s at 1.5s intervals

    async function poll() {
      if (cancelled) return;
      if (!sessionId) {
        setStatus('pending');
        return;
      }
      const { data } = await supabase
        .from('shop_orders')
        .select('order_ref, quantity, total_pence')
        .eq('stripe_session_id', sessionId)
        .maybeSingle();
      if (cancelled) return;
      if (data) {
        setOrder(data as ShopOrder);
        setStatus('found');
        return;
      }
      attempts += 1;
      if (attempts >= MAX_ATTEMPTS) {
        setStatus('pending');
        return;
      }
      timer = setTimeout(poll, 1500);
    }

    poll();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [sessionId]);

  const refValue =
    status === 'found'
      ? order?.order_ref
      : status === 'loading'
        ? 'Fetching your reference…'
        : 'Your order reference is on its way by email';

  const itemValue = `Locco Coffee Beans, 250g${order?.quantity ? ` x ${order.quantity}` : ''}`;
  const totalValue = order ? gbp(order.total_pence) : status === 'loading' ? '…' : 'See your email';

  return (
    <Screen scroll contentStyle={styles.content}>
      <Header showBack onMenu={open} />

      <View style={styles.tick}>
        <Ionicons name="checkmark" size={40} color={Colors.gold} />
      </View>

      <Text style={styles.title}>Thank you for your order</Text>
      <Text style={styles.sub}>
        {email ? `We have emailed your confirmation to ${email}` : 'We have emailed your confirmation to you'}
      </Text>

      <View style={styles.card}>
        <DetailRow label="Order reference" value={refValue} loading={status === 'loading'} highlight />
        <DetailRow label="Item" value={itemValue} />
        <DetailRow label="Delivery" value="Royal Mail Tracked 48" />
        <DetailRow label="Total paid" value={totalValue} />
      </View>

      <Button label="BACK TO MENU" onPress={() => router.replace('/' as Href)} style={styles.btn} />
    </Screen>
  );
}

function DetailRow({
  label,
  value,
  loading,
  highlight,
}: {
  label: string;
  value?: string;
  loading?: boolean;
  highlight?: boolean;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      {loading ? (
        <ActivityIndicator color={Colors.gold} />
      ) : (
        <Text style={highlight ? styles.rowValueGold : styles.rowValue}>{value}</Text>
      )}
    </View>
  );
}

const FONT = Fonts.family;

const styles = StyleSheet.create({
  content: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl, alignItems: 'center' },
  tick: {
    width: 84, height: 84, borderRadius: 42, borderWidth: 2, borderColor: Colors.gold,
    alignItems: 'center', justifyContent: 'center', marginTop: Spacing.xl, marginBottom: Spacing.lg,
  },
  title: {
    fontFamily: FONT, fontWeight: '700', fontSize: 22, letterSpacing: 0.5,
    color: Colors.white, textAlign: 'center', marginBottom: Spacing.sm,
  },
  sub: {
    fontFamily: FONT, fontWeight: '300', fontSize: 14, lineHeight: 21,
    color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.xl, maxWidth: 320,
  },
  card: {
    alignSelf: 'stretch', borderRadius: Radius.lg, backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.goldBorder, padding: Spacing.lg, marginBottom: Spacing.xl,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, gap: Spacing.md },
  rowLabel: { fontFamily: FONT, fontWeight: '400', fontSize: 13, color: Colors.textMuted },
  rowValue: { fontFamily: FONT, fontWeight: '500', fontSize: 14, color: Colors.white, flexShrink: 1, textAlign: 'right' },
  rowValueGold: { fontFamily: FONT, fontWeight: '700', fontSize: 14, color: Colors.gold, letterSpacing: 1, flexShrink: 1, textAlign: 'right' },
  btn: { alignSelf: 'stretch' },
});
