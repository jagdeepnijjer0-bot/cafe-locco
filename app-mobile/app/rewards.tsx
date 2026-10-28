import React, { useCallback, useRef, useState } from 'react';
import { View, StyleSheet, Pressable, ActivityIndicator, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect, Href } from 'expo-router';

import { Screen } from '@/components/ui/Screen';
import { Header } from '@/components/ui/Header';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { useAppMenu, useReturnToMenuOnBack } from '@/components/AppMenu';
import { useAuthContext } from '@/components/AuthProvider';
import { RewardsQrModal } from '@/components/RewardsQrModal';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/colors';
import { Fonts, Spacing, Radius } from '@/constants/theme';

type IconName = keyof typeof Ionicons.glyphMap;

interface Tier {
  points: number;
  label: string;
  icon: IconName;
}

// Display-only ladder (the server enforces the real rules).
const TIERS: Tier[] = [
  { points: 75, label: 'Free drink', icon: 'cafe-outline' },
  { points: 150, label: 'Free meal', icon: 'restaurant-outline' },
  { points: 250, label: 'Free dessert', icon: 'ice-cream-outline' },
  { points: 500, label: 'Prize draw entry', icon: 'gift-outline' },
];

const POLL_MS = 15_000;

/** Rewards tab. Signed out -> sign-in/up landing. Signed in -> Rewards home. */
export default function RewardsScreen() {
  const { open } = useAppMenu();
  useReturnToMenuOnBack();
  const { isLoggedIn, loading, profile } = useAuthContext();

  if (loading && !profile) {
    return (
      <Screen>
        <Header title="REWARDS" showBack onMenu={open} />
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={Colors.gold} />
        </View>
      </Screen>
    );
  }

  if (!isLoggedIn) {
    return <SignedOut open={open} />;
  }

  return <RewardsHome open={open} />;
}

/* ------------------------------------------------------------------ */
/* Signed-out landing                                                  */
/* ------------------------------------------------------------------ */
function SignedOut({ open }: { open: () => void }) {
  const router = useRouter();
  return (
    <Screen scroll contentStyle={styles.content}>
      <Header title="REWARDS" showBack onMenu={open} />

      <View style={styles.landingIcon}>
        <Ionicons name="gift-outline" size={34} color={Colors.gold} />
      </View>

      <Text style={styles.landingTitle}>CAFÉ LOCCO REWARDS</Text>
      <View style={styles.rule} />
      <Text style={styles.landingBody}>
        Earn a point for every £1 you spend, climb the rewards ladder, and unlock free drinks,
        meals, desserts and prize-draw entries. Create an account to start earning.
      </Text>

      <View style={styles.ladderPreview}>
        {TIERS.map((t) => (
          <View key={t.points} style={styles.previewRow}>
            <View style={styles.previewIcon}>
              <Ionicons name={t.icon} size={18} color={Colors.gold} />
            </View>
            <Text style={styles.previewPts}>{t.points}</Text>
            <Text style={styles.previewLabel}>{t.label}</Text>
          </View>
        ))}
      </View>

      <Button
        label="CREATE ACCOUNT"
        onPress={() => router.push('/(auth)/signup')}
        style={styles.landingBtn}
      />
      <Pressable onPress={() => router.push('/(auth)/login')} hitSlop={8} style={styles.signinRow}>
        <Text variant="caption" center color={Colors.textMuted} tracking={2}>
          ALREADY HAVE AN ACCOUNT?{'  '}
          <Text variant="label" color={Colors.gold} tracking={2}>
            SIGN IN
          </Text>
        </Text>
      </Pressable>
    </Screen>
  );
}

/* ------------------------------------------------------------------ */
/* Signed-in Rewards home                                              */
/* ------------------------------------------------------------------ */
function RewardsHome({ open }: { open: () => void }) {
  const router = useRouter();
  const { profile, user, signOut } = useAuthContext();

  const [balance, setBalance] = useState<number>(profile?.points_balance ?? 0);
  const [qrVisible, setQrVisible] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  // Seed last-seen entries so we only pop up on a FUTURE increase, not on load.
  const lastEntries = useRef<number | null>(profile?.prize_draw_entries ?? null);

  // Keep balance fresh: refresh on focus + a short poll. When prize_draw_entries
  // increases (server's 500 -> auto-entry + reset signal) show the pop-up.
  const loadStats = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('restaurant_profiles')
      .select('points_balance, prize_draw_entries')
      .eq('id', user.id)
      .maybeSingle();
    if (!data) return;
    setBalance(data.points_balance ?? 0);
    const entries = data.prize_draw_entries ?? 0;
    if (lastEntries.current != null && entries > lastEntries.current) {
      setCelebrate(true);
    }
    lastEntries.current = entries;
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadStats();
      const id = setInterval(loadStats, POLL_MS);
      return () => clearInterval(id);
    }, [loadStats]),
  );

  const next = TIERS.find((t) => balance < t.points) ?? TIERS[TIERS.length - 1];
  const remaining = Math.max(0, next.points - balance);
  const progress = Math.min(1, balance / next.points);

  function handleSignOut() {
    Alert.alert('Sign out?', 'You can sign back in any time.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => signOut().catch(() => {}) },
    ]);
  }

  return (
    <Screen scroll contentStyle={styles.content}>
      <Header title="REWARDS" showBack onMenu={open} />

      {/* Balance */}
      <View style={styles.balanceWrap}>
        <Text style={styles.balanceNum}>{balance}</Text>
        <Text style={styles.balanceLabel}>POINTS</Text>
      </View>

      {/* Progress to next tier */}
      <View style={styles.progressCard}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {remaining === 0
            ? `You qualify for a ${next.label.toLowerCase()}!`
            : `${remaining} more ${remaining === 1 ? 'point' : 'points'} for a ${next.label.toLowerCase()}`}
        </Text>
      </View>

      {/* Ladder */}
      <Text style={styles.sectionTitle}>REWARDS LADDER</Text>
      <View style={styles.rule} />
      <View style={styles.ladder}>
        {TIERS.map((t) => {
          const qualified = balance >= t.points;
          return (
            <View key={t.points} style={[styles.tierRow, qualified && styles.tierRowActive]}>
              <View style={[styles.tierIcon, qualified && styles.tierIconActive]}>
                <Ionicons
                  name={t.icon}
                  size={20}
                  color={qualified ? Colors.background : Colors.gold}
                />
              </View>
              <View style={styles.tierText}>
                <Text style={styles.tierLabel} color={qualified ? Colors.gold : Colors.textPrimary}>
                  {t.label.toUpperCase()}
                </Text>
                <Text style={styles.tierPts}>{t.points} POINTS</Text>
              </View>
              {qualified ? (
                <Ionicons name="checkmark-circle" size={22} color={Colors.gold} />
              ) : (
                <Text style={styles.tierLocked}>{Math.max(0, t.points - balance)} to go</Text>
              )}
            </View>
          );
        })}
      </View>

      {/* Show code */}
      <Button label="SHOW MY CODE" onPress={() => setQrVisible(true)} style={styles.showCodeBtn} />

      {/* Account */}
      <Text style={styles.sectionTitle}>ACCOUNT</Text>
      <View style={styles.rule} />
      <View style={styles.accountCard}>
        <Text style={styles.accountName}>{profile?.full_name || 'Member'}</Text>
        <Text style={styles.accountEmail}>{profile?.email}</Text>
      </View>
      <Pressable onPress={handleSignOut} style={({ pressed }) => [styles.acctRow, pressed && styles.acctRowPressed]}>
        <Ionicons name="log-out-outline" size={20} color={Colors.textSecondary} />
        <Text style={styles.acctRowText}>Sign out</Text>
        <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
      </Pressable>
      <Pressable
        onPress={() => router.push('/delete-account' as Href)}
        style={({ pressed }) => [styles.acctRow, pressed && styles.acctRowPressed]}
      >
        <Ionicons name="trash-outline" size={20} color={Colors.error} />
        <Text style={styles.acctRowText} color={Colors.error}>Delete my account</Text>
        <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
      </Pressable>

      <RewardsQrModal visible={qrVisible} onClose={() => setQrVisible(false)} />

      {/* Prize-draw celebration */}
      <Modal visible={celebrate} transparent animationType="fade" onRequestClose={() => setCelebrate(false)}>
        <View style={styles.celebrateBackdrop}>
          <View style={styles.celebrateCard}>
            <View style={styles.celebrateIcon}>
              <Ionicons name="trophy-outline" size={40} color={Colors.gold} />
            </View>
            <Text style={styles.celebrateTitle}>YOU'RE IN THE PRIZE DRAW!</Text>
            <Text style={styles.celebrateBody}>
              You reached 500 points — you've been entered into the Café Locco prize draw and your
              balance has reset. Keep earning for your next entry!
            </Text>
            <Button label="AMAZING" onPress={() => setCelebrate(false)} style={styles.celebrateBtn} />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const FONT = Fonts.family;

const styles = StyleSheet.create({
  content: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  rule: { width: 44, height: 1.5, backgroundColor: Colors.gold, marginBottom: Spacing.lg },

  // Signed-out landing
  landingIcon: {
    width: 64, height: 64, borderRadius: 32, borderWidth: 1, borderColor: Colors.goldBorder,
    alignItems: 'center', justifyContent: 'center', alignSelf: 'center',
    marginTop: Spacing.xl, marginBottom: Spacing.lg,
  },
  landingTitle: {
    fontFamily: FONT, fontWeight: '700', fontSize: 18, letterSpacing: 3,
    color: Colors.white, textAlign: 'center', marginBottom: Spacing.md,
  },
  landingBody: {
    fontFamily: FONT, fontWeight: '300', fontSize: 13.5, lineHeight: 22, letterSpacing: 0.4,
    color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.xl,
  },
  ladderPreview: {
    borderWidth: 1, borderColor: Colors.goldBorder, borderRadius: Radius.lg,
    backgroundColor: Colors.surface, padding: Spacing.lg, marginBottom: Spacing.xl, gap: Spacing.md,
  },
  previewRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  previewIcon: {
    width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: Colors.goldBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  previewPts: { fontFamily: FONT, fontWeight: '700', fontSize: 15, color: Colors.gold, width: 44 },
  previewLabel: { fontFamily: FONT, fontWeight: '400', fontSize: 13, color: Colors.textSecondary, flex: 1 },
  landingBtn: { marginBottom: Spacing.lg },
  signinRow: { alignItems: 'center' },

  // Balance
  balanceWrap: { alignItems: 'center', marginTop: Spacing.xl, marginBottom: Spacing.lg },
  balanceNum: {
    fontFamily: FONT, fontWeight: '700', fontSize: 72, lineHeight: 80, color: Colors.gold,
    textAlign: 'center',
  },
  balanceLabel: {
    fontFamily: FONT, fontWeight: '500', fontSize: 13, letterSpacing: 4,
    color: Colors.textMuted, marginTop: 2,
  },

  // Progress
  progressCard: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.lg,
    backgroundColor: Colors.surface, padding: Spacing.lg, marginBottom: Spacing.xl,
  },
  progressTrack: {
    height: 10, borderRadius: Radius.pill, backgroundColor: Colors.surfaceElevated, overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: Radius.pill, backgroundColor: Colors.gold },
  progressText: {
    fontFamily: FONT, fontWeight: '400', fontSize: 13, letterSpacing: 0.5,
    color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.md,
  },

  sectionTitle: {
    fontFamily: FONT, fontWeight: '700', fontSize: 12, letterSpacing: 3,
    color: Colors.white, marginBottom: Spacing.sm,
  },

  // Ladder
  ladder: { gap: Spacing.md, marginBottom: Spacing.xl },
  tierRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.lg,
    backgroundColor: Colors.surface, padding: Spacing.md,
  },
  tierRowActive: { borderColor: Colors.gold },
  tierIcon: {
    width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: Colors.goldBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  tierIconActive: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  tierText: { flex: 1 },
  tierLabel: { fontFamily: FONT, fontWeight: '600', fontSize: 13, letterSpacing: 1, color: Colors.textPrimary },
  tierPts: { fontFamily: FONT, fontWeight: '400', fontSize: 11, letterSpacing: 1, color: Colors.textMuted, marginTop: 2 },
  tierLocked: { fontFamily: FONT, fontWeight: '400', fontSize: 11, color: Colors.textMuted },

  showCodeBtn: { marginBottom: Spacing.xl },

  // Account
  accountCard: {
    borderWidth: 1, borderColor: Colors.goldBorder, borderRadius: Radius.lg,
    backgroundColor: Colors.surface, padding: Spacing.lg, marginBottom: Spacing.md,
  },
  accountName: { fontFamily: FONT, fontWeight: '600', fontSize: 15, color: Colors.textPrimary },
  accountEmail: { fontFamily: FONT, fontWeight: '400', fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  acctRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.lg,
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg, marginBottom: Spacing.sm,
  },
  acctRowPressed: { opacity: 0.7, borderColor: Colors.gold },
  acctRowText: { flex: 1, fontFamily: FONT, fontWeight: '500', fontSize: 14, color: Colors.textSecondary },

  // Celebration
  celebrateBackdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  celebrateCard: {
    borderWidth: 1, borderColor: Colors.gold, borderRadius: Radius.lg,
    backgroundColor: Colors.surface, padding: Spacing.xl, alignItems: 'center',
  },
  celebrateIcon: {
    width: 72, height: 72, borderRadius: 36, borderWidth: 1.5, borderColor: Colors.gold,
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg,
  },
  celebrateTitle: {
    fontFamily: FONT, fontWeight: '700', fontSize: 18, letterSpacing: 2,
    color: Colors.gold, textAlign: 'center', marginBottom: Spacing.md,
  },
  celebrateBody: {
    fontFamily: FONT, fontWeight: '300', fontSize: 13.5, lineHeight: 22,
    color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.xl,
  },
  celebrateBtn: { alignSelf: 'stretch' },
});
