import React from 'react';
import { View, StyleSheet, Pressable, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '@/components/ui/Screen';
import { Header } from '@/components/ui/Header';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Text } from '@/components/ui/Text';
import { useAppMenu, useReturnToMenuOnBack } from '@/components/AppMenu';
import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/theme';

type Social = {
  name: string;
  handle: string;
  icon: keyof typeof Ionicons.glyphMap;
  url: string;
};

const SOCIALS: Social[] = [
  {
    name: 'INSTAGRAM',
    handle: '@cafelocco',
    icon: 'logo-instagram',
    url: 'https://instagram.com/cafelocco',
  },
  {
    name: 'TIKTOK',
    handle: '@cafelocco',
    icon: 'logo-tiktok',
    url: 'https://tiktok.com/@cafelocco',
  },
  {
    name: 'FACEBOOK',
    handle: 'Cafe Locco',
    icon: 'logo-facebook',
    url: 'https://www.facebook.com/share/1GzuMhM7k9/?mibextid=wwXIfr',
  },
];

export default function SocialScreen() {
  const { open } = useAppMenu();
  useReturnToMenuOnBack();

  const openUrl = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Unable to open', 'Your device could not open this link.');
    });
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <Header title="SOCIALS" showBack onMenu={open} />

      <SectionHeader
        title="FOLLOW US"
        subtitle="Join the Café Locco community and stay close to everything we serve."
      />

      <View style={styles.list}>
        {SOCIALS.map((social) => (
          <Pressable
            key={social.name}
            style={({ pressed }) => [styles.pill, pressed && styles.pillPressed]}
            onPress={() => openUrl(social.url)}
          >
            <View style={styles.iconBadge}>
              <Ionicons name={social.icon} size={26} color={Colors.gold} />
            </View>
            <View style={styles.pillText}>
              <Text variant="heading" tracking={3} color={Colors.textPrimary}>
                {social.name}
              </Text>
              <Text variant="caption" tracking={1} color={Colors.textSecondary} style={styles.handle}>
                {social.handle}
              </Text>
            </View>
            <Ionicons name="open-outline" size={20} color={Colors.textMuted} />
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },
  list: { gap: Spacing.md },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  pillPressed: { opacity: 0.75, borderColor: Colors.gold },
  iconBadge: {
    width: 52,
    height: 52,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillText: { flex: 1, marginLeft: Spacing.md },
  handle: { marginTop: 4 },
});
