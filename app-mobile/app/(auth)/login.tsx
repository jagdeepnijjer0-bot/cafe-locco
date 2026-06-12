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

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, loading } = useAuthContext();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const next: { email?: string; password?: string } = {};
    if (!email.trim()) next.email = 'Email is required';
    else if (!EMAIL_RE.test(email)) next.email = 'Invalid email format';
    if (!password) next.password = 'Password is required';

    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
      router.replace('/dashboard');
    } catch (err: any) {
      Alert.alert('Sign In Failed', err?.message ?? 'Unable to sign in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        {router.canGoBack() && (
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
          </Pressable>
        )}

        <View style={styles.logoWrap}>
          <Image source={logo} style={styles.logo} contentFit="contain" />
        </View>

        <View style={styles.header}>
          <Text variant="heading" center color={Colors.textPrimary} tracking={3}>
            MEMBER LOGIN
          </Text>
          <Text variant="caption" center color={Colors.textMuted} tracking={2} style={styles.subtitle}>
            LOG IN TO ACCESS YOUR MEMBERSHIP
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Email"
            placeholder="your@email.com"
            value={email}
            onChangeText={(t) => setEmail(t)}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="emailAddress"
          />

          <View>
            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={(t) => setPassword(t)}
              error={errors.password}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              textContentType="password"
            />
            <Pressable
              onPress={() => setShowPassword((s) => !s)}
              style={styles.eye}
              hitSlop={8}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={Colors.textMuted}
              />
            </Pressable>
          </View>

          <View style={styles.forgotRow}>
            <Pressable onPress={() => router.push('/(auth)/forgot-password')} hitSlop={8}>
              <Text variant="caption" color={Colors.textMuted} tracking={1}>
                FORGOT PASSWORD?
              </Text>
            </Pressable>
          </View>

          <Button
            label="Sign In"
            onPress={handleSubmit}
            loading={submitting || loading}
            style={styles.submit}
          />
        </View>

        <View style={styles.footer}>
          <Text variant="caption" center color={Colors.textMuted} tracking={2}>
            NEW HERE?
          </Text>
          <Pressable onPress={() => router.push('/(auth)/signup')} hitSlop={8} style={styles.footerLink}>
            <Text variant="label" center color={Colors.gold} tracking={2}>
              CREATE ACCOUNT
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.xl },
  flex: { flex: 1 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginLeft: -8 },
  logoWrap: { alignItems: 'center', marginTop: Spacing.sm, marginBottom: Spacing.xl },
  logo: { width: 120, height: 120 },
  header: { marginBottom: Spacing.xl },
  subtitle: { marginTop: Spacing.sm },
  form: { marginBottom: Spacing.xl },
  eye: { position: 'absolute', right: 16, top: 40 },
  forgotRow: { alignItems: 'flex-end', marginBottom: Spacing.lg },
  submit: { marginTop: Spacing.sm },
  footer: { alignItems: 'center', marginTop: 'auto', paddingTop: Spacing.xl },
  footerLink: { marginTop: Spacing.sm },
});
