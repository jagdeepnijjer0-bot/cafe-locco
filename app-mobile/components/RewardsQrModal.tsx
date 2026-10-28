import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { Text } from '@/components/ui/Text';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/theme';

const { width } = Dimensions.get('window');
const QR_SIZE = Math.min(width - 96, 300);
// Server token TTL is ~60s; refresh a little early so the code is always valid.
const REFRESH_MS = 50_000;

/** Full-screen, bright, auto-rotating loyalty QR. Encodes the short-lived
 *  token from the `rewards-qr-token` edge function (never the raw profile id). */
export function RewardsQrModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchToken = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('rewards-qr-token');
      if (fnError) throw fnError;
      if (!data?.token) throw new Error('No code returned');
      setToken(data.token as string);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load your code');
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      fetchToken();
      timer.current = setInterval(fetchToken, REFRESH_MS);
    } else {
      setToken(null);
    }
    return () => {
      if (timer.current) {
        clearInterval(timer.current);
        timer.current = null;
      }
    };
  }, [visible, fetchToken]);

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <SafeAreaView style={styles.backdrop} edges={['top', 'bottom']}>
        <Pressable onPress={onClose} hitSlop={14} style={styles.closeBtn}>
          <Ionicons name="close" size={26} color={Colors.white} />
        </Pressable>

        <View style={styles.center}>
          <Text variant="heading" center tracking={3} color={Colors.white} style={styles.title}>
            YOUR REWARDS CODE
          </Text>
          <Text variant="caption" center tracking={1.5} color={Colors.textMuted} style={styles.sub}>
            SHOW THIS TO STAFF TO EARN OR REDEEM
          </Text>

          <View style={styles.card}>
            {token ? (
              <QRCode value={token} size={QR_SIZE} backgroundColor="#FFFFFF" color="#000000" />
            ) : (
              <View style={[styles.placeholder, { width: QR_SIZE, height: QR_SIZE }]}>
                {error ? (
                  <Text variant="caption" center color={Colors.error}>
                    {error}
                  </Text>
                ) : (
                  <ActivityIndicator color={Colors.gold} />
                )}
              </View>
            )}
          </View>

          <Text variant="caption" center tracking={1} color={Colors.textMuted} style={styles.note}>
            {refreshing ? 'Refreshing…' : 'Refreshes automatically — keep this screen open'}
          </Text>
          {error ? (
            <Pressable onPress={fetchToken} hitSlop={8} style={styles.retry}>
              <Text variant="label" tracking={2} color={Colors.gold}>
                TAP TO RETRY
              </Text>
            </Pressable>
          ) : null}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: '#000' },
  closeBtn: {
    alignSelf: 'flex-end',
    width: 44,
    height: 44,
    margin: Spacing.md,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 60 },
  title: { marginBottom: Spacing.sm },
  sub: { marginBottom: Spacing.xl },
  card: {
    backgroundColor: '#FFFFFF',
    padding: Spacing.lg,
    borderRadius: Radius.lg,
  },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  note: { marginTop: Spacing.xl, maxWidth: 280 },
  retry: { marginTop: Spacing.md },
});
