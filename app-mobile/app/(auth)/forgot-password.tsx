import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthContext } from '@/components/AuthProvider';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/theme';

const logo = require('@/assets/images/logo.png');

const EMAIL_RE = /\S+@\S+\.\S+/;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { forgotPassword, loading } = useAuthContext();

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!EMAIL_RE.test(email)) {
      setError('Invalid email format');
      return;
    }

    setError(undefined);
    setSubmitting(true);
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch (err: any) {
      Alert.alert('Reset Failed', err?.message ?? 'Unable to send reset link. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const goToSignIn = () => router.push('/(auth)/login');

  return (
    <Screen scroll contentStyle={styles.content}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View style={styles.logoWrap}>
          <Image source={logo} style={styles.logo} contentFit="contain" />
        </View>

        <View style={styles.header}>
          <Text variant="heading" center color={Colors.textPrimary} tracking={3}>
            RESET PASSWORD
          </Text>
          <Text variant="caption" center color={Colors.textMuted} tracking={2} style={styles.subtitle}>
            {sent
              ? 'CHECK YOUR EMAIL FOR A LINK TO RESET YOUR PASSWORD'
              : 'ENTER YOUR EMAIL AND WE WILL SEND YOU A LINK TO RESET YOUR PASSWORD'}
          </Text>
        </View>

        {sent ? (
          <View style={styles.confirm}>
            <Ionicons name="mail-outline" size={48} color={Colors.gold} />
            <Text variant="body" center color={Colors.textSecondary} style={styles.confirmText}>
              We sent a reset link to {email.trim()}. Follow the instructions in the email to set a
              new password.
            </Text>
            <Button label="Back to Sign In" onPress={goToSignIn} style={styles.submit} />
          </View>
        ) : (
          <View style={styles.form}>
            <Input
              label="Email"
              placeholder="your@email.com"
              value={email}
              onChangeText={setEmail}
              error={error}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="emailAddress"
            />

            <Button
              label="Send Reset Link"
              onPress={handleSubmit}
              loading={submitting || loading}
              style={styles.submit}
            />
          </View>
        )}

        {!sent && (
          <View style={styles.footer}>
            <Pressable onPress={goToSignIn} hitSlop={8} style={styles.footerLink}>
              <Text variant="label" center color={Colors.gold} tracking={2}>
                BACK TO SIGN IN
              </Text>
            </Pressable>
          </View>
        )}
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.xl },
  flex: { flex: 1 },
  logoWrap: { alignItems: 'center', marginTop: Spacing.lg, marginBottom: Spacing.xl },
  logo: { width: 120, height: 120 },
  header: { marginBottom: Spacing.xl },
  subtitle: { marginTop: Spacing.sm, paddingHorizontal: Spacing.md },
  form: { marginBottom: Spacing.xl },
  submit: { marginTop: Spacing.sm },
  confirm: { alignItems: 'center', marginTop: Spacing.lg },
  confirmText: { marginTop: Spacing.lg, marginBottom: Spacing.xl },
  footer: { alignItems: 'center', marginTop: 'auto', paddingTop: Spacing.xl },
  footerLink: { marginTop: Spacing.sm },
});
