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

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp, loading } = useAuthContext();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const next: FormErrors = {};
    if (!fullName.trim()) next.fullName = 'Full name is required';
    if (!email.trim()) next.email = 'Email is required';
    else if (!EMAIL_RE.test(email)) next.email = 'Invalid email format';
    if (!password) next.password = 'Password is required';
    else if (password.length < 6) next.password = 'Password must be at least 6 characters';
    if (password !== confirmPassword) next.confirmPassword = 'Passwords do not match';

    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      await signUp(email.trim(), password, fullName.trim());
      router.replace('/dashboard');
    } catch (err: any) {
      Alert.alert('Sign Up Failed', err?.message ?? 'Unable to create account. Please try again.');
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
        <View style={styles.logoWrap}>
          <Image source={logo} style={styles.logo} contentFit="contain" />
        </View>

        <View style={styles.header}>
          <Text variant="heading" center color={Colors.textPrimary} tracking={3}>
            CREATE ACCOUNT
          </Text>
          <Text variant="caption" center color={Colors.textMuted} tracking={2} style={styles.subtitle}>
            CREATE YOUR ACCOUNT TO BEGIN YOUR PREMIUM MEMBERSHIP
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Full Name"
            placeholder="Enter your full name"
            value={fullName}
            onChangeText={setFullName}
            error={errors.fullName}
            autoCapitalize="words"
            textContentType="name"
          />

          <Input
            label="Email"
            placeholder="your@email.com"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="emailAddress"
          />

          <View>
            <Input
              label="Password"
              placeholder="Minimum 6 characters"
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              textContentType="newPassword"
            />
            <Pressable onPress={() => setShowPassword((s) => !s)} style={styles.eye} hitSlop={8}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={Colors.textMuted}
              />
            </Pressable>
          </View>

          <View>
            <Input
              label="Confirm Password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              error={errors.confirmPassword}
              secureTextEntry={!showConfirm}
              autoCapitalize="none"
              textContentType="newPassword"
            />
            <Pressable onPress={() => setShowConfirm((s) => !s)} style={styles.eye} hitSlop={8}>
              <Ionicons
                name={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={Colors.textMuted}
              />
            </Pressable>
          </View>

          <Button
            label="Create Account"
            onPress={handleSubmit}
            loading={submitting || loading}
            style={styles.submit}
          />
        </View>

        <View style={styles.footer}>
          <Text variant="caption" center color={Colors.textMuted} tracking={2}>
            ALREADY A MEMBER?
          </Text>
          <Pressable onPress={() => router.push('/(auth)/login')} hitSlop={8} style={styles.footerLink}>
            <Text variant="label" center color={Colors.gold} tracking={2}>
              SIGN IN
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
  logoWrap: { alignItems: 'center', marginTop: Spacing.md, marginBottom: Spacing.lg },
  logo: { width: 110, height: 110 },
  header: { marginBottom: Spacing.xl },
  subtitle: { marginTop: Spacing.sm },
  form: { marginBottom: Spacing.xl },
  eye: { position: 'absolute', right: 16, top: 40 },
  submit: { marginTop: Spacing.sm },
  footer: { alignItems: 'center', marginTop: 'auto', paddingTop: Spacing.xl },
  footerLink: { marginTop: Spacing.sm },
});
