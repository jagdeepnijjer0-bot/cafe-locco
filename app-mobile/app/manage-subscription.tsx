import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import { useRouter } from 'expo-router';
import { format, parseISO } from 'date-fns';

import { Screen } from '@/components/ui/Screen';
import { Header } from '@/components/ui/Header';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { useAppMenu } from '@/components/AppMenu';
import { useAuthContext } from '@/components/AuthProvider';
import { useMembership } from '@/hooks/useMembership';
import { createPortalSession } from '@/lib/stripe';
import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/theme';

const PRICE_DISPLAY = process.env.EXPO_PUBLIC_MEMBERSHIP_PRICE_DISPLAY ?? '£24.00 / month';

const STATUS_LABEL: Record<string, string> = {
  active: 'ACTIVE',
  past_due: 'PAST DUE',
  cancelled: 'CANCELLED',
  inactive: 'INACTIVE',
};

const FAQ: { q: string; a: string }[] = [
  {
    q: 'HOW DO I UPDATE MY PAYMENT METHOD?',
    a: 'Open the secure billing portal to update your card, view invoices, and manage payment details.',
  },
  {
    q: 'WHEN WILL I BE BILLED?',
    a: 'Your membership renews automatically on your next renewal date. You can cancel any time before then.',
  },
  {
    q: 'WHAT HAPPENS IF I CANCEL?',
    a: 'You keep full access to all member benefits until the end of your current billing period.',
  },
];

function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  try {
    return format(parseISO(value), 'd MMMM yyyy').toUpperCase();
  } catch {
    return '—';
  }
}

export default function ManageSubscriptionScreen() {
  const { open } = useAppMenu();
  const router = useRouter();
  const { user, isLoggedIn } = useAuthContext();
  const { membership, loading } = useMembership(user?.id);
  const [portalLoading, setPortalLoading] = useState(false);

  // Not logged in — prompt to sign in
  if (!isLoggedIn) {
    return (
      <Screen scroll contentStyle={styles.content}>
        <Header title="MANAGE SUBSCRIPTION" showBack onMenu={open} />
        <View style={styles.promptWrap}>
          <View style={styles.badgeIcon}>
            <Ionicons name="lock-closed-outline" size={26} color={Colors.gold} />
          </View>
          <Text variant="heading" center tracking={4} style={styles.promptTitle}>
            MEMBERS ONLY
          </Text>
          <Text variant="body" center style={styles.promptBody}>
            Sign in to view and manage your membership.
          </Text>
          <Button label="SIGN IN" onPress={() => router.push('/(auth)/login')} style={styles.stretch} />
        </View>
      </Screen>
    );
  }

  if (loading) {
    return (
      <Screen contentStyle={styles.centerFlex}>
        <Header title="MANAGE SUBSCRIPTION" showBack onMenu={open} />
        <View style={styles.centerFlex}>
          <ActivityIndicator color={Colors.gold} size="large" />
        </View>
      </Screen>
    );
  }

  const status = membership?.status ?? 'inactive';
  const statusLabel = STATUS_LABEL[status] ?? status.toUpperCase();
  const isActive = status === 'active';
  const cancelPending = !!membership?.cancel_at_period_end;
  const renewalDate = formatDate(membership?.current_period_end);

  async function handleBillingPortal() {
    setPortalLoading(true);
    try {
      const session = await createPortalSession();
      if (session?.url) {
        await WebBrowser.openBrowserAsync(session.url);
      } else {
        Alert.alert('Billing Portal', 'The billing portal is not available right now. Please try again later.');
      }
    } catch {
      Alert.alert('Billing Portal', 'We could not open the billing portal. Please try again later.');
    } finally {
      setPortalLoading(false);
    }
  }

  function handleCancel() {
    Alert.alert(
      'Cancel Membership?',
      'You will keep access to all member benefits until the end of your current billing period.',
      [
        { text: 'Keep Membership', style: 'cancel' },
        {
          text: 'Cancel Membership',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Manage Cancellation',
              'Cancellations are handled securely through the billing portal. Opening it now.',
              [
                { text: 'Not Now', style: 'cancel' },
                { text: 'Open Portal', onPress: handleBillingPortal },
              ],
            );
          },
        },
      ],
    );
  }

  return (
    <Screen scroll contentStyle={styles.content}>
      <Header title="MANAGE SUBSCRIPTION" showBack onMenu={open} />

      {/* Current plan */}
      <LinearGradient
        colors={[Colors.goldBorder, Colors.goldBorderSoft, 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardBorder}
      >
        <View style={styles.cardInner}>
          <View style={[styles.statusBadge, isActive ? styles.statusActive : styles.statusInactive]}>
            <Ionicons
              name={isActive ? 'checkmark-circle' : 'alert-circle-outline'}
              size={14}
              color={isActive ? Colors.success : Colors.textMuted}
            />
            <Text variant="caption" tracking={2} color={isActive ? Colors.success : Colors.textMuted}>
              {statusLabel}
            </Text>
          </View>

          <Text variant="heading" center tracking={4} color={Colors.gold}>
            PREMIUM MEMBERSHIP
          </Text>
          <Text variant="display" center style={styles.price}>
            {PRICE_DISPLAY}
          </Text>
        </View>
      </LinearGradient>

      {/* Plan details */}
      <View style={styles.detailCard}>
        <View style={styles.detailRow}>
          <Text variant="caption" tracking={1} color={Colors.textSecondary}>
            STATUS
          </Text>
          <Text variant="label" tracking={1}>
            {statusLabel}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.detailRow}>
          <Text variant="caption" tracking={1} color={Colors.textSecondary}>
            {cancelPending ? 'ACCESS ENDS' : 'NEXT RENEWAL'}
          </Text>
          <Text variant="label" tracking={1}>
            {renewalDate}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.detailRow}>
          <Text variant="caption" tracking={1} color={Colors.textSecondary}>
            AUTO-RENEW
          </Text>
          <Text variant="label" tracking={1} color={cancelPending ? Colors.warning : Colors.textPrimary}>
            {cancelPending ? 'OFF' : 'ON'}
          </Text>
        </View>
      </View>

      {cancelPending ? (
        <View style={styles.noticeCard}>
          <Ionicons name="information-circle-outline" size={18} color={Colors.warning} />
          <Text variant="caption" tracking={1} color={Colors.textSecondary} style={styles.noticeText}>
            YOUR MEMBERSHIP IS SET TO CANCEL AND WILL NOT RENEW. ACCESS CONTINUES UNTIL {renewalDate}.
          </Text>
        </View>
      ) : null}

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          label="UPDATE PAYMENT / BILLING PORTAL"
          onPress={handleBillingPortal}
          loading={portalLoading}
        />
        {!cancelPending ? (
          <Button label="CANCEL MEMBERSHIP" variant="outline" onPress={handleCancel} style={styles.cancelButton} />
        ) : null}
      </View>

      {/* FAQ / notes */}
      <Text variant="heading" center tracking={4} style={styles.faqTitle}>
        FREQUENTLY ASKED
      </Text>
      <View style={styles.faqList}>
        {FAQ.map((item) => (
          <View key={item.q} style={styles.faqItem}>
            <Text variant="label" tracking={1} style={styles.faqQuestion}>
              {item.q}
            </Text>
            <Text variant="body" color={Colors.textSecondary} style={styles.faqAnswer}>
              {item.a}
            </Text>
          </View>
        ))}
      </View>

      <Text variant="caption" center tracking={1} style={styles.footerNote}>
        CANCEL ANYTIME • SECURE PAYMENT • MANAGED VIA STRIPE
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },
  centerFlex: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  stretch: { alignSelf: 'stretch' },

  // Sign-in prompt
  promptWrap: { alignItems: 'center', paddingTop: Spacing.xxl, paddingHorizontal: Spacing.md },
  badgeIcon: {
    width: 56,
    height: 56,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    backgroundColor: Colors.goldGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  promptTitle: { marginBottom: Spacing.md },
  promptBody: { maxWidth: 300, marginBottom: Spacing.xl },

  // Plan card
  cardBorder: { borderRadius: Radius.lg, padding: 1.5, marginTop: Spacing.lg, marginBottom: Spacing.lg },
  cardInner: {
    borderRadius: Radius.lg - 1,
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    borderRadius: Radius.pill,
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statusActive: { borderColor: Colors.success, backgroundColor: 'rgba(76,175,132,0.12)' },
  statusInactive: { borderColor: Colors.border, backgroundColor: Colors.surfaceElevated },
  price: { marginTop: Spacing.md },

  // Detail card
  detailCard: {
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
  },
  divider: { height: 1, backgroundColor: Colors.borderSubtle },

  // Notice
  noticeCard: {
    flexDirection: 'row',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceElevated,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  noticeText: { flex: 1, lineHeight: 18 },

  // Actions
  actions: { gap: Spacing.md, marginBottom: Spacing.xl },
  cancelButton: {},

  // FAQ
  faqTitle: { marginBottom: Spacing.lg },
  faqList: { gap: Spacing.md, marginBottom: Spacing.xl },
  faqItem: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
  },
  faqQuestion: { marginBottom: Spacing.sm },
  faqAnswer: { lineHeight: 20 },

  footerNote: { maxWidth: 320, alignSelf: 'center' },
});
