import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Href } from 'expo-router';

import { Screen } from '@/components/ui/Screen';
import { Header } from '@/components/ui/Header';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Text } from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAppMenu } from '@/components/AppMenu';
import { submitContactMessage } from '@/lib/submissions';
import { Colors } from '@/constants/colors';
import { Fonts, Spacing, Radius } from '@/constants/theme';

const ADDRESS = '139 Daventry Rd, Coventry CV3 5HD';
const PHONE = '024 7704 9561';
const EMAIL = 'info@cafelocco.co.uk';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ContactRow = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  url: string;
};

const CONTACT_ROWS: ContactRow[] = [
  {
    icon: 'location-outline',
    label: 'VISIT US',
    value: ADDRESS,
    url: `https://maps.google.com/?q=${encodeURIComponent(ADDRESS)}`,
  },
  {
    icon: 'call-outline',
    label: 'CALL US',
    value: PHONE,
    url: `tel:${PHONE.replace(/\s/g, '')}`,
  },
  {
    icon: 'mail-outline',
    label: 'EMAIL US',
    value: EMAIL,
    url: `mailto:${EMAIL}`,
  },
];

export default function ContactScreen() {
  const { open } = useAppMenu();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const openUrl = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Unable to open', 'Your device could not handle this action.');
    });
  };

  const handleSubmit = async () => {
    const nextErrors: typeof errors = {};
    if (!name.trim()) nextErrors.name = 'Name is required';
    if (!email.trim()) nextErrors.email = 'Email is required';
    else if (!EMAIL_REGEX.test(email)) nextErrors.email = 'Please enter a valid email';
    if (!message.trim()) nextErrors.message = 'Message is required';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await submitContactMessage({ name: name.trim(), email: email.trim(), message: message.trim() });
      setName('');
      setEmail('');
      setMessage('');
      Alert.alert(
        'Message Sent',
        'Thank you for reaching out to Café Locco. We will be in touch shortly.',
      );
    } catch (e) {
      const m = e instanceof Error ? e.message : 'Please try again.';
      Alert.alert('Message not sent', `We could not send your message.\n\n${m}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <Header title="CONTACT US" showBack onMenu={open} />

      <SectionHeader
        title="GET IN TOUCH"
        subtitle="We would love to hear from you. Reach us directly or send a message below."
      />

      <View style={styles.rows}>
        {CONTACT_ROWS.map((row) => (
          <Pressable
            key={row.label}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            onPress={() => openUrl(row.url)}
          >
            <View style={styles.iconBadge}>
              <Ionicons name={row.icon} size={20} color={Colors.gold} />
            </View>
            <View style={styles.rowText}>
              <Text variant="caption" tracking={2} color={Colors.textSecondary}>
                {row.label}
              </Text>
              <Text variant="label" color={Colors.textPrimary} style={styles.rowValue}>
                {row.value}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </Pressable>
        ))}
      </View>

      <View style={styles.formCard}>
        <Text variant="heading" tracking={3} center style={styles.formTitle}>
          SEND A MESSAGE
        </Text>

        <Input
          label="Name"
          placeholder="Your name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          error={errors.name}
        />
        <Input
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          error={errors.email}
        />
        <Input
          label="Message"
          placeholder="How can we help?"
          value={message}
          onChangeText={setMessage}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          style={styles.messageInput}
          error={errors.message}
        />

        <Button
          label="SEND MESSAGE"
          variant="primary"
          loading={submitting}
          onPress={handleSubmit}
          style={styles.submit}
        />
      </View>

      <Text style={styles.privacyNote}>
        By sending a message you agree to our{' '}
        <Text style={styles.privacyLink} onPress={() => router.push('/privacy-policy' as Href)}>
          Privacy Policy
        </Text>
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },
  rows: { gap: Spacing.md, marginBottom: Spacing.xl },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
  },
  rowPressed: { opacity: 0.7, borderColor: Colors.gold },
  rowText: { flex: 1, marginLeft: Spacing.md },
  rowValue: { marginTop: 4 },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formCard: {
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
  },
  formTitle: { marginBottom: Spacing.lg },
  messageInput: { height: 120, paddingTop: 14 },
  submit: { marginTop: Spacing.sm },
  privacyNote: {
    fontFamily: Fonts.family,
    fontWeight: '400',
    fontSize: 11.5,
    letterSpacing: 0.5,
    lineHeight: 18,
    color: 'rgba(212, 175, 55, 0.7)',
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
  privacyLink: {
    color: Colors.gold,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
