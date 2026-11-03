import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Dimensions,
  AppState,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { Text } from '@/components/ui/Text';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/theme';

const { width } = Dimensions.get('window');
const QR_SIZE = Math.min(width - 96, 300);
// Fallback TTL only if the server omits expires_at/ttl_seconds (it shouldn't).
const FALLBACK_TTL = 60;

function nowSec() {
  return Math.floor(Date.now() / 1000);
}

/** Full-screen, bright loyalty QR with a live countdown to the server-provided
 *  expiry. When it expires (or the app returns from the background after expiry)
 *  the code is hidden and a manual "get a new code" button is shown — there is
 *  no background auto-refresh loop, so an expired code can never be scanned. */
export function RewardsQrModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [token, setToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState<number>(nowSec());

  const tick = useRef<ReturnType<typeof setInterval> | null>(null);
  const insets = useSafeAreaInsets();

  const fetchToken = useCallback(async () => {
    setLoading(true);
    setError(null);
    setToken(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('rewards-qr-token');
      if (fnError) throw fnError;
      if (!data?.token) throw new Error('No code returned');
      const exp =
        typeof data.expires_at === 'number'
          ? data.expires_at
          : nowSec() + (typeof data.ttl_seconds === 'number' ? data.ttl_seconds : FALLBACK_TTL);
      setToken(data.token as string);
      setExpiresAt(exp);
      setNow(nowSec());
    } catch (e) {
      setToken(null);
      setExpiresAt(null);
      setError(e instanceof Error ? e.message : 'Could not load your code');
    } finally {
      setLoading(false);
    }
  }, []);

  // While visible: fetch once, tick the clock every second (countdown only — no
  // auto-refetch), and re-sync the clock when returning from the background.
  useEffect(() => {
    if (!visible) {
      setToken(null);
      setExpiresAt(null);
      setError(null);
      setLoading(false);
      return;
    }

    fetchToken();
    setNow(nowSec());
    tick.current = setInterval(() => setNow(nowSec()), 1000);

    const sub = AppState.addEventListener('change', (s) => {
      // Re-sync the clock on foreground so an expiry that passed while
      // backgrounded shows the refresh state immediately (no stale QR).
      if (s === 'active') setNow(nowSec());
    });

    return () => {
      if (tick.current) {
        clearInterval(tick.current);
        tick.current = null;
      }
      sub.remove();
    };
  }, [visible, fetchToken]);

  const remaining = expiresAt != null ? Math.max(0, expiresAt - now) : 0;
  const hasValidCode = !!token && expiresAt != null && remaining > 0;

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <SafeAreaView style={styles.backdrop} edges={['top', 'bottom']}>
        <View style={styles.center}>
          <Text variant="heading" center tracking={3} color={Colors.white} style={styles.title}>
            YOUR REWARDS CODE
          </Text>
          <Text variant="caption" center tracking={1.5} color={Colors.textMuted} style={styles.sub}>
            SHOW THIS TO STAFF TO EARN OR REDEEM
          </Text>

          {hasValidCode ? (
            <>
              <View style={styles.cardLight}>
                <QRCode value={token as string} size={QR_SIZE} backgroundColor="#FFFFFF" color="#000000" />
              </View>
              <Text variant="label" center tracking={2} color={Colors.gold} style={styles.countdown}>
                EXPIRES IN {remaining}s
              </Text>
              <Text variant="caption" center tracking={1} color={Colors.textMuted} style={styles.note}>
                Keep this screen open while staff scan it
              </Text>
            </>
          ) : (
            <View style={[styles.cardDark, { width: QR_SIZE + Spacing.lg * 2, height: QR_SIZE + Spacing.lg * 2 }]}>
              {loading ? (
                <ActivityIndicator color={Colors.gold} />
              ) : (
                <>
                  <Ionicons name="refresh" size={44} color={Colors.gold} />
                  <Text variant="caption" center color={error ? Colors.error : Colors.textMuted} style={styles.refreshMsg}>
                    {error ? error : 'This code has expired'}
                  </Text>
                  <Pressable
                    onPress={fetchToken}
                    hitSlop={8}
                    style={({ pressed }) => [styles.refreshBtn, pressed && styles.refreshBtnPressed]}
                  >
                    <Ionicons name="refresh" size={18} color={Colors.gold} />
                    <Text variant="label" tracking={1.5} color={Colors.gold}>
                      TAP TO GET A NEW CODE
                    </Text>
                  </Pressable>
                </>
              )}
            </View>
          )}
        </View>
      </SafeAreaView>

      {/* Fixed close button: absolute top-right, safe-area aware, never moves
          with content, styled to match the main menu close button. */}
      <Pressable
        onPress={onClose}
        hitSlop={12}
        style={[styles.closeBtn, { top: insets.top + 8 }]}
      >
        <Ionicons name="close" size={22} color={Colors.textPrimary} />
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: '#000' },
  closeBtn: {
    position: 'absolute',
    right: Spacing.md,
    // top is set from the safe-area inset at render time (insets.top + 8).
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    elevation: 10,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 60 },
  title: { marginBottom: Spacing.sm },
  sub: { marginBottom: Spacing.xl },
  cardLight: {
    backgroundColor: '#FFFFFF',
    padding: Spacing.lg,
    borderRadius: Radius.lg,
  },
  cardDark: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  countdown: { marginTop: Spacing.lg },
  note: { marginTop: Spacing.sm, maxWidth: 280 },
  refreshMsg: { maxWidth: 220 },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: Colors.gold,
    borderRadius: Radius.pill,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: Spacing.xs,
  },
  refreshBtnPressed: { opacity: 0.7, backgroundColor: 'rgba(212,175,55,0.08)' },
});
