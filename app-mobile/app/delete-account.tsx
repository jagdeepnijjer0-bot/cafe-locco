import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Screen } from '@/components/ui/Screen';
import { Header } from '@/components/ui/Header';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { useAppMenu } from '@/components/AppMenu';
import { useAuthContext } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/theme';

/** Delete Account — in-app account deletion (Apple guideline 5.1.1(v)). */
export default function DeleteAccountScreen() {
  const { open } = useAppMenu();
  const router = useRouter();
  const { isLoggedIn, signOut } = useAuthContext();
  const [loading, setLoading] = useState(false);

  async function performDelete() {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('delete-account');
      if (error) throw error;
      await signOut();
      Alert.alert('Account deleted', 'Your account and data have been removed.');
      router.replace('/');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Please try again.';
      Alert.alert(
        'Could not delete account',
        `${message}\n\nIf this keeps happening, email info@cafelocco.co.uk to request deletion.`,
      );
    } finally {
      setLoading(false);
    }
  }

  function confirmDelete() {
    Alert.alert(
      'Delete account?',
      'This permanently deletes your account, membership and data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: performDelete },
      ],
    );
  }

  if (!isLoggedIn) {
    return (
      <Screen scroll contentStyle={styles.content}>
        <Header title="DELETE ACCOUNT" showBack onMenu={open} />
        <View style={styles.center}>
          <Text variant="body" center>
            Sign in to manage or delete your account.
          </Text>
          <Button label="SIGN IN" onPress={() => router.push('/(auth)/login')} style={styles.btn} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll contentStyle={styles.content}>
      <Header title="DELETE ACCOUNT" showBack onMenu={open} />

      <View style={styles.iconWrap}>
        <Ionicons name="warning-outline" size={26} color={Colors.error} />
      </View>

      <Text variant="heading" center tracking={3} style={styles.title}>
        PERMANENTLY DELETE ACCOUNT
      </Text>

      <Text variant="body" center style={styles.body}>
        Deleting your account will permanently remove your profile, membership and any saved data
        from Cafe Locco. This action cannot be undone.
      </Text>
      <Text variant="body" center style={styles.body}>
        If you have an active paid membership, please cancel it first from Manage Subscription.
      </Text>

      <Button
        label="DELETE MY ACCOUNT"
        variant="outline"
        onPress={confirmDelete}
        loading={loading}
        style={styles.btn}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },
  center: { alignItems: 'center', paddingTop: Spacing.xxl },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  title: { marginBottom: Spacing.md },
  body: { maxWidth: 340, alignSelf: 'center', marginBottom: Spacing.md },
  btn: { alignSelf: 'stretch', marginTop: Spacing.lg },
});
