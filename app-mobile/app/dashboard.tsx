import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, type Href } from 'expo-router';
import { format, parseISO } from 'date-fns';

import { Screen } from '@/components/ui/Screen';
import { Header } from '@/components/ui/Header';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { useAppMenu } from '@/components/AppMenu';
import { useAuthContext } from '@/components/AuthProvider';
import { useMembership } from '@/hooks/useMembership';
import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/theme';

export default function DashboardScreen() {
  const { open } = useAppMenu();
  const router = useRouter();
  const { user, profile, isLoggedIn } = useAuthContext();
  const {
    membership,
    loading,
    hasAccess,
    hasClaimedThisMonth,
    claimCoffee,
  } = useMembership(user?.id);
  const [claiming, setClaiming] = useState(false);

  // Not logged in — show sign-in prompt
  if (!isLoggedIn) {
    return (
      <Screen scroll contentStyle={styles.content}>
        <Header title="MY MEMBERSHIP" showBack onMenu={open} />
        <View style={styles.promptWrap}>
          <View style={styles.badgeIcon}>
            <Ionicons name="lock-closed-outline" size={26} color={Colors.gold} />
          </View>
          <Text variant="heading" center tracking={4} style={styles.promptTitle}>
            MEMBERS ONLY
          </Text>
          <Text variant="body" center style={styles.promptBody}>
            Sign in to access your membership, claim your complimentary coffee, and manage your subscription.
          </Text>
          <Button label="SIGN IN" onPress={() => router.push('/(auth)/login')} style={styles.promptButton} />
        </View>
      </Screen>
    );
  }

  // Loading state
  if (loading) {
    return (
      <Screen contentStyle={styles.centerFlex}>
        <Header title="MY MEMBERSHIP" showBack onMenu={open} />
        <View style={styles.centerFlex}>
          <ActivityIndicator color={Colors.gold} size="large" />
        </View>
      </Screen>
    );
  }

  const memberName = profile?.full_name || user?.email || 'CAFÉ LOCCO MEMBER';
  const memberEmail = user?.email ?? '';
  const isActive = hasAccess;

  const memberSince =
    membership?.created_at
      ? format(parseISO(membership.created_at), 'MMMM yyyy').toUpperCase()
      : null;

  async function handleClaim() {
    setClaiming(true);
    try {
      await claimCoffee();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unable to claim your coffee right now.';
      Alert.alert('Coffee Claim', message);
    } finally {
      setClaiming(false);
    }
  }

  return (
    <Screen scroll contentStyle={styles.content}>
      <Header title="MY MEMBERSHIP" showBack onMenu={open} />

      {/* Member identity + status */}
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
              {isActive ? 'ACTIVE MEMBER' : 'INACTIVE'}
            </Text>
          </View>

          <Text variant="title" center style={styles.memberName}>
            {memberName}
          </Text>
          {memberEmail ? (
            <Text variant="caption" center tracking={1} style={styles.memberEmail}>
              {memberEmail}
            </Text>
          ) : null}
          {memberSince ? (
            <Text variant="caption" center tracking={2} style={styles.memberSince}>
              MEMBER SINCE {memberSince}
            </Text>
          ) : null}
        </View>
      </LinearGradient>

      {!isActive ? (
        <View style={styles.inactiveCard}>
          <Text variant="body" center style={styles.inactiveText}>
            Your membership is not active. Become a member to unlock your complimentary coffee and member perks.
          </Text>
          <Button
            label="BECOME A MEMBER"
            onPress={() => router.push('/membership')}
            style={styles.inactiveButton}
          />
        </View>
      ) : (
        <>
          {/* Free coffee claim */}
          <View style={styles.claimCard}>
            <View style={styles.coffeeIcon}>
              <Ionicons
                name={hasClaimedThisMonth ? 'checkmark-done-outline' : 'cafe-outline'}
                size={26}
                color={Colors.gold}
              />
            </View>
            {hasClaimedThisMonth ? (
              <>
                <Text variant="heading" center tracking={3} style={styles.claimTitle}>
                  COFFEE CLAIMED
                </Text>
                <Text variant="body" center style={styles.claimBody}>
                  You have claimed your complimentary coffee this month. See you again next month.
                </Text>
              </>
            ) : (
              <>
                <Text variant="heading" center tracking={3} style={styles.claimTitle}>
                  CLAIM YOUR FREE COFFEE
                </Text>
                <Text variant="body" center style={styles.claimBody}>
                  Enjoy one complimentary coffee on us, included with your membership this month.
                </Text>
                <Button
                  label="CLAIM NOW"
                  onPress={handleClaim}
                  loading={claiming}
                  style={styles.claimButton}
                />
              </>
            )}
          </View>

          {/* Manage */}
          <Button
            label="MANAGE SUBSCRIPTION"
            variant="outline"
            onPress={() => router.push('/manage-subscription')}
            style={styles.manageButton}
          />
        </>
      )}

      {/* Account settings — account deletion (Apple guideline 5.1.1(v)) */}
      <Pressable
        onPress={() => router.push('/delete-account' as Href)}
        hitSlop={8}
        style={styles.deleteLink}
      >
        <Text variant="caption" tracking={2} color={Colors.error}>
          DELETE ACCOUNT
        </Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },
  centerFlex: { flex: 1, alignItems: 'center', justifyContent: 'center' },

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
  promptButton: { alignSelf: 'stretch' },

  // Member card
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
  memberName: { marginBottom: Spacing.xs },
  memberEmail: { marginBottom: Spacing.sm },
  memberSince: {},

  // Inactive
  inactiveCard: {
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  inactiveText: { marginBottom: Spacing.lg, maxWidth: 320 },
  inactiveButton: { alignSelf: 'stretch' },

  // Claim
  claimCard: {
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  coffeeIcon: {
    width: 56,
    height: 56,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    backgroundColor: Colors.goldGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  claimTitle: { marginBottom: Spacing.sm },
  claimBody: { maxWidth: 320, marginBottom: Spacing.lg },
  claimButton: { alignSelf: 'stretch' },
  manageButton: { marginTop: Spacing.xs },
  deleteLink: { alignSelf: 'center', marginTop: Spacing.xxl, paddingVertical: Spacing.sm },
});
