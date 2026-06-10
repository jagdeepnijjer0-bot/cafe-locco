import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '@/components/ui/Screen';
import { Header } from '@/components/ui/Header';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Text } from '@/components/ui/Text';
import { useAppMenu } from '@/components/AppMenu';
import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/theme';

const storyImage = require('@/assets/images/figma-ecd2c95a.png');

const STORY_PARAGRAPHS = [
  'At Café Locco, our greatest passion lies in delivering a refined dining experience that still feels like home. It all started with a shared love of great food and a dream to create a space where people could come together to enjoy it.',
  'From our thoughtfully curated menu to our warm, welcoming atmosphere, every aspect of Café Locco has been shaped with care to ensure that each visit is unforgettable.',
];

const PILLARS: { icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { icon: 'cafe-outline', label: 'PREMIUM\nQUALITY' },
  { icon: 'people-outline', label: 'COMMUNITY' },
  { icon: 'heart-outline', label: 'HOSPITALITY' },
];

export default function AboutScreen() {
  const { open } = useAppMenu();

  return (
    <Screen scroll contentStyle={styles.content}>
      <Header title="OUR STORY" showBack onMenu={open} />

      <View style={styles.hero}>
        <Image source={storyImage} style={styles.heroImage} contentFit="cover" />
      </View>

      <SectionHeader title="OUR STORY" subtitle="A refined dining experience that still feels like home." />

      {STORY_PARAGRAPHS.map((paragraph) => (
        <View key={paragraph} style={styles.card}>
          <Text variant="body" center style={styles.cardText}>
            {paragraph}
          </Text>
        </View>
      ))}

      <View style={styles.card}>
        <View style={styles.iconBadge}>
          <Ionicons name="heart-outline" size={24} color={Colors.gold} />
        </View>
        <Text variant="heading" center tracking={3} style={styles.cardHeading}>
          OUR MISSION
        </Text>
        <Text variant="body" center style={styles.cardText}>
          To delight guests with exceptional food and heartfelt hospitality, creating a sense of community that brings people closer together.
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.iconBadge}>
          <Ionicons name="sparkles-outline" size={22} color={Colors.gold} />
        </View>
        <Text variant="heading" center tracking={3} style={styles.cardHeading}>
          OUR VISION
        </Text>
        <Text variant="body" center style={styles.cardText}>
          We envision Café Locco leading the way in culinary innovation, continually evolving to offer outstanding flavours while serving as a place where genuine connections and memories are made.
        </Text>
      </View>

      <View style={styles.pillars}>
        {PILLARS.map((pillar) => (
          <View key={pillar.label} style={styles.pillar}>
            <View style={styles.iconBadge}>
              <Ionicons name={pillar.icon} size={20} color={Colors.gold} />
            </View>
            <Text variant="caption" center tracking={1} color={Colors.textPrimary} style={styles.pillarLabel}>
              {pillar.label}
            </Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },
  hero: {
    width: '100%',
    height: 240,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginVertical: Spacing.lg,
  },
  heroImage: { width: '100%', height: '100%' },
  card: {
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  cardText: { lineHeight: 24 },
  cardHeading: { marginBottom: Spacing.sm },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  pillars: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  pillar: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
  },
  pillarLabel: { marginTop: Spacing.xs, lineHeight: 16 },
});
