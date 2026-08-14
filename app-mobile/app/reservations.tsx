import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Href } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Screen } from '@/components/ui/Screen';
import { Header } from '@/components/ui/Header';
import { Text } from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAppMenu, useReturnToMenuOnBack } from '@/components/AppMenu';
import { Colors } from '@/constants/colors';
import { Fonts, Spacing, Radius } from '@/constants/theme';
import type { ReservationInput } from '@/lib/types';
import { submitReservation } from '@/lib/submissions';

// Opening hours per weekday (0 = Sun … 6 = Sat), in minutes from midnight.
// Reservation slots run every 30 minutes from opening until 30 minutes before
// closing (the last bookable slot).
//   Mon–Thu & Sun: 09:00–20:00  →  last slot 19:30
//   Fri–Sat:       09:00–21:00  →  last slot 20:30
const OPENING_HOURS: Record<number, { open: number; close: number }> = {
  0: { open: 9 * 60, close: 20 * 60 }, // Sunday
  1: { open: 9 * 60, close: 20 * 60 }, // Monday
  2: { open: 9 * 60, close: 20 * 60 }, // Tuesday
  3: { open: 9 * 60, close: 20 * 60 }, // Wednesday
  4: { open: 9 * 60, close: 20 * 60 }, // Thursday
  5: { open: 9 * 60, close: 21 * 60 }, // Friday
  6: { open: 9 * 60, close: 21 * 60 }, // Saturday
};
const SLOT_INTERVAL = 30; // minutes between slots
const LAST_SLOT_BEFORE_CLOSE = 30; // last slot is this many minutes before close

const MIN_GUESTS = 1;
const MAX_GUESTS = 20;

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTHS = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC',
];

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

function minutesToLabel(mins: number) {
  return `${pad(Math.floor(mins / 60))}:${pad(mins % 60)}`;
}

/** Weekday (0 = Sun … 6 = Sat) for a DD/MM/YYYY value. */
function weekdayOfDate(value: string) {
  const [dd, mm, yyyy] = value.split('/').map(Number);
  return new Date(yyyy, mm - 1, dd).getDay();
}

/** All 30-minute slots for the given DD/MM/YYYY date, based on opening hours. */
function slotsForDate(value: string): string[] {
  const hours = OPENING_HOURS[weekdayOfDate(value)];
  if (!hours) return []; // closed that day
  const lastSlot = hours.close - LAST_SLOT_BEFORE_CLOSE;
  const out: string[] = [];
  for (let t = hours.open; t <= lastSlot; t += SLOT_INTERVAL) {
    out.push(minutesToLabel(t));
  }
  return out;
}

interface DayChip {
  value: string; // DD/MM/YYYY
  weekday: string;
  day: string;
  month: string;
}

/** RESERVATIONS — genuine Cafe Locco booking form (date chips, time pills, guest stepper). */
export default function ReservationsScreen() {
  const router = useRouter();
  const { open } = useAppMenu();
  useReturnToMenuOnBack();

  // Track the current time so the "at least 1 hour ahead" filter for today's
  // slots updates on its own as the clock advances (checked every 30s).
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const upcomingDays = useMemo<DayChip[]>(() => {
    const out: DayChip[] = [];
    const base = new Date();
    base.setHours(0, 0, 0, 0);
    for (let i = 0; i < 14; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      out.push({
        value: `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`,
        weekday: DAYS[d.getDay()],
        day: pad(d.getDate()),
        month: MONTHS[d.getMonth()],
      });
    }
    return out;
  }, []);

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState(2);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 30-minute slots for the selected date's opening hours. On today's date,
  // only slots at least 1 hour ahead of now are shown; future dates keep all.
  const todayValue = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;
  const availableTimes = useMemo(() => {
    if (!date) return [];
    const slots = slotsForDate(date);
    if (date !== todayValue) return slots;
    const minMinutes = now.getHours() * 60 + now.getMinutes() + 60;
    return slots.filter((slot) => {
      const [h, m] = slot.split(':').map(Number);
      return h * 60 + m >= minMinutes;
    });
  }, [date, todayValue, now]);

  // Clear a selected time once it falls inside the 1-hour window (time passed).
  useEffect(() => {
    if (time && !availableTimes.includes(time)) setTime('');
  }, [availableTimes, time]);

  const tap = () => {
    Haptics.selectionAsync().catch(() => {});
  };

  const adjustGuests = (delta: number) => {
    tap();
    setGuests((g) => Math.min(MAX_GUESTS, Math.max(MIN_GUESTS, g + delta)));
  };

  const handleConfirm = async () => {
    if (!date) return setError('Please select a date.');
    if (!time) return setError('Please select a time.');
    if (!name.trim()) return setError('Please enter your full name.');
    if (!email.trim()) return setError('Please enter your email address.');
    if (!phone.trim()) return setError('Please enter your phone number.');
    setError('');

    const reservation: ReservationInput = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      date,
      time,
      guests,
      notes: notes.trim() || undefined,
    };

    setSubmitting(true);
    let reference: string;
    try {
      reference = await submitReservation(reservation);
    } catch (e) {
      setSubmitting(false);
      const message = e instanceof Error ? e.message : 'Please try again.';
      Alert.alert('Reservation failed', `We could not save your booking.\n\n${message}`);
      return;
    }
    setSubmitting(false);

    router.push({
      pathname: '/reservation-confirmation',
      params: {
        reference,
        name: reservation.name,
        email: reservation.email,
        phone: reservation.phone,
        date: reservation.date,
        time: reservation.time,
        guests: String(reservation.guests),
        notes: reservation.notes ?? '',
      },
    });
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <Header title="RESERVATIONS" showBack onMenu={open} />

      <View style={styles.body}>
        <Text variant="title" center style={styles.intro}>
          Reserve Your Table
        </Text>
        <Text variant="body" center color={Colors.textSecondary} style={styles.introSub}>
          Cafe Locco, 139 Daventry Rd, Coventry CV3 5HD
        </Text>

        {/* DATE */}
        <View style={styles.card}>
          <Text variant="heading" center tracking={3} style={styles.cardTitle}>
            SELECT DATE
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            {upcomingDays.map((d) => {
              const selected = d.value === date;
              return (
                <Pressable
                  key={d.value}
                  onPress={() => {
                    tap();
                    setDate(d.value);
                  }}
                  style={[styles.dayChip, selected && styles.chipSelected]}
                >
                  <Text
                    variant="caption"
                    center
                    tracking={1}
                    color={selected ? Colors.background : Colors.textMuted}
                  >
                    {d.weekday}
                  </Text>
                  <Text
                    variant="label"
                    center
                    color={selected ? Colors.background : Colors.textPrimary}
                    style={styles.dayNum}
                  >
                    {d.day}
                  </Text>
                  <Text
                    variant="caption"
                    center
                    tracking={1}
                    color={selected ? Colors.background : Colors.textMuted}
                  >
                    {d.month}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* TIME */}
        <View style={styles.card}>
          <Text variant="heading" center tracking={3} style={styles.cardTitle}>
            SELECT TIME
          </Text>
          {!date ? (
            <Text variant="caption" center tracking={1} color={Colors.textMuted}>
              Please select a date first.
            </Text>
          ) : availableTimes.length === 0 ? (
            <Text variant="caption" center tracking={1} color={Colors.textMuted}>
              No more times available for this date. Please select another date.
            </Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}
            >
              {availableTimes.map((slot) => {
                const selected = slot === time;
                return (
                  <Pressable
                    key={slot}
                    onPress={() => {
                      tap();
                      setTime(slot);
                    }}
                    style={[styles.timePill, selected && styles.chipSelected]}
                  >
                    <Text
                      variant="label"
                      tracking={2}
                      color={selected ? Colors.background : Colors.textPrimary}
                    >
                      {slot}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* GUESTS */}
        <View style={styles.card}>
          <Text variant="heading" center tracking={3} style={styles.cardTitle}>
            NUMBER OF GUESTS
          </Text>
          <View style={styles.stepperRow}>
            <Pressable
              onPress={() => adjustGuests(-1)}
              disabled={guests <= MIN_GUESTS}
              style={[styles.stepBtn, guests <= MIN_GUESTS && styles.stepBtnDisabled]}
            >
              <Ionicons name="remove" size={22} color={Colors.textPrimary} />
            </Pressable>

            <View style={styles.stepValue}>
              <Text variant="display" center style={styles.guestNum}>
                {guests}
              </Text>
              <Text variant="caption" center tracking={2} color={Colors.textMuted}>
                {guests === 1 ? 'GUEST' : 'GUESTS'}
              </Text>
            </View>

            <Pressable
              onPress={() => adjustGuests(1)}
              disabled={guests >= MAX_GUESTS}
              style={[styles.stepBtn, guests >= MAX_GUESTS && styles.stepBtnDisabled]}
            >
              <Ionicons name="add" size={22} color={Colors.textPrimary} />
            </Pressable>
          </View>
        </View>

        {/* DETAILS */}
        <View style={styles.card}>
          <Text variant="heading" center tracking={3} style={styles.cardTitle}>
            YOUR DETAILS
          </Text>
          <Input
            label="Full Name"
            placeholder="FULL NAME"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            returnKeyType="next"
          />
          <Input
            label="Email Address"
            placeholder="EMAIL ADDRESS"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            returnKeyType="next"
          />
          <Input
            label="Phone Number"
            placeholder="PHONE NUMBER"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            returnKeyType="next"
          />
          <Input
            label="Special Requests (Optional)"
            placeholder="DIETARY REQUIREMENTS OR SPECIAL OCCASIONS"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            style={styles.notes}
          />

          {error ? (
            <Text variant="caption" center color={Colors.error} style={styles.errorText}>
              {error}
            </Text>
          ) : null}

          <Button label="Request Reservation" onPress={handleConfirm} loading={submitting} style={styles.confirmBtn} />
        </View>

        <Text style={styles.privacyNote}>
          By making a reservation you agree to our{' '}
          <Text style={styles.privacyLink} onPress={() => router.push('/privacy-policy' as Href)}>
            Privacy Policy
          </Text>
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: Spacing.xxl },
  body: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
  intro: { marginTop: Spacing.sm },
  introSub: { marginTop: Spacing.xs, marginBottom: Spacing.lg },
  card: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.surface,
  },
  cardTitle: { marginBottom: Spacing.lg },
  chipRow: { gap: Spacing.sm, paddingVertical: Spacing.xs },
  dayChip: {
    width: 64,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNum: { fontSize: 18, marginVertical: 2 },
  timePill: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xl,
  },
  stepBtn: {
    width: 52,
    height: 52,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    borderColor: Colors.goldBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnDisabled: { opacity: 0.35 },
  stepValue: { minWidth: 90, alignItems: 'center' },
  guestNum: { fontFamily: Fonts.serifBold, marginBottom: 2 },
  notes: { height: 110, paddingTop: 14, textAlignVertical: 'top' },
  errorText: { marginBottom: Spacing.md },
  confirmBtn: { marginTop: Spacing.sm },
  privacyNote: {
    fontFamily: Fonts.family,
    fontWeight: '400',
    fontSize: 11.5,
    letterSpacing: 0.5,
    lineHeight: 18,
    color: 'rgba(212, 175, 55, 0.7)',
    textAlign: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  privacyLink: {
    color: Colors.gold,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
