import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { Header } from '@/components/ui/Header';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { useAppMenu } from '@/components/AppMenu';
import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/theme';

const ALPHANUM = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function firstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

interface DetailRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}

function DetailRow({ icon, label, value }: DetailRowProps) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={22} color={Colors.gold} />
      </View>
      <View style={styles.detailText}>
        <Text variant="caption" tracking={1} color={Colors.textSecondary}>
          {label}
        </Text>
        <Text variant="label" color={Colors.textPrimary} style={styles.detailValue}>
          {value}
        </Text>
      </View>
    </View>
  );
}

/** RESERVATION CONFIRMED — success state with generated confirmation number + summary. */
export default function ReservationConfirmationScreen() {
  const router = useRouter();
  const { open } = useAppMenu();
  const params = useLocalSearchParams();

  const name = firstParam(params.name);
  const email = firstParam(params.email);
  const phone = firstParam(params.phone);
  const date = firstParam(params.date);
  const time = firstParam(params.time);
  const guests = firstParam(params.guests) || '0';
  const notes = firstParam(params.notes);

  const confirmationNumber = useMemo(() => {
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += ALPHANUM[Math.floor(Math.random() * ALPHANUM.length)];
    }
    return `CL-${code}`;
  }, []);

  const guestCount = Number(guests) || 0;

  return (
    <Screen scroll contentStyle={styles.content}>
      <Header showBack onMenu={open} />

      <View style={styles.body}>
        <View style={styles.iconWrap}>
          <Ionicons name="checkmark-circle" size={96} color={Colors.gold} />
        </View>

        <Text variant="heading" center tracking={3} style={styles.title}>
          RESERVATION CONFIRMED
        </Text>
        <Text variant="body" center color={Colors.textSecondary} style={styles.subtitle}>
          We have sent a confirmation to{'\n'}
          <Text variant="body" color={Colors.gold}>
            {email || 'your email'}
          </Text>
        </Text>

        <View style={styles.confNumberCard}>
          <Text variant="caption" center tracking={1} color={Colors.textSecondary}>
            CONFIRMATION NUMBER
          </Text>
          <Text variant="title" center color={Colors.white} style={styles.confNumber}>
            {confirmationNumber}
          </Text>
        </View>

        <View style={styles.card}>
          <Text variant="heading" center tracking={3} style={styles.cardTitle}>
            RESERVATION DETAILS
          </Text>

          <DetailRow icon="person-outline" label="NAME" value={name || '—'} />
          <DetailRow icon="calendar-outline" label="DATE" value={date || '—'} />
          <DetailRow icon="time-outline" label="TIME" value={time || '—'} />
          <DetailRow
            icon="people-outline"
            label="PARTY SIZE"
            value={`${guestCount} ${guestCount === 1 ? 'Guest' : 'Guests'}`}
          />
          <DetailRow icon="call-outline" label="PHONE" value={phone || '—'} />

          {notes ? (
            <>
              <View style={styles.divider} />
              <View>
                <Text variant="caption" tracking={1} color={Colors.textSecondary}>
                  SPECIAL REQUESTS
                </Text>
                <Text variant="body" color={Colors.textPrimary} style={styles.notes}>
                  {notes}
                </Text>
              </View>
            </>
          ) : null}
        </View>

        <View style={styles.infoCard}>
          <Text variant="body" center color={Colors.textSecondary} style={styles.infoText}>
            Please arrive 10 minutes before your reservation time. To cancel or modify your booking,
            contact us at least 24 hours in advance on 024 7704 9561.
          </Text>
        </View>

        <Button
          label="Back to Home"
          onPress={() => router.push('/')}
          style={styles.homeBtn}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: Spacing.xxl },
  body: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, alignItems: 'center' },
  iconWrap: { marginTop: Spacing.lg, marginBottom: Spacing.lg },
  title: { marginBottom: Spacing.sm },
  subtitle: { marginBottom: Spacing.xl },
  confNumberCard: {
    width: '100%',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    backgroundColor: Colors.goldGlow,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  confNumber: { letterSpacing: 4, marginTop: Spacing.xs },
  card: {
    width: '100%',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.goldBorderSoft,
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  cardTitle: { marginBottom: Spacing.lg },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    backgroundColor: Colors.goldGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailText: { flex: 1 },
  detailValue: { marginTop: 2 },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  notes: { marginTop: Spacing.xs },
  infoCard: {
    width: '100%',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.goldBorderSoft,
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  infoText: { lineHeight: 22 },
  homeBtn: { width: '100%', marginTop: Spacing.sm },
});
