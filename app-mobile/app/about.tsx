import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';

import { Screen } from '@/components/ui/Screen';
import { Header } from '@/components/ui/Header';
import { Text } from '@/components/ui/Text';
import { useAppMenu } from '@/components/AppMenu';
import { Colors } from '@/constants/colors';
import { Fonts, Spacing, Radius } from '@/constants/theme';

// Existing Cafe Locco assets (from the genuine Figma export)
const imageOne = require('@/assets/images/figma-ecd2c95a.png');
const imageTwo = require('@/assets/images/figma-5cc577b4.png');

const INTRO =
  'AT CAFÉ LOCCO, OUR GREATEST PASSION LIES IN DELIVERING A REFINED DINING EXPERIENCE THAT STILL FEELS LIKE HOME. IT ALL STARTED WITH A SHARED LOVE OF GREAT FOOD AND A DREAM TO CREATE A SPACE WHERE PEOPLE COULD COME TOGETHER TO ENJOY IT. FROM OUR THOUGHTFULLY CURATED MENU TO OUR WARM, WELCOMING ATMOSPHERE, EVERY ASPECT OF CAFÉ LOCCO HAS BEEN SHAPED WITH CARE TO ENSURE THAT EACH VISIT IS UNFORGETTABLE.';

const VISION =
  'CAFÉ LOCCO LEADING THE WAY IN CULINARY INNOVATION, CONTINUALLY EVOLVING TO OFFER OUTSTANDING FLAVOURS WHILE SERVING AS A PLACE WHERE GENUINE CONNECTIONS AND MEMORIES ARE MADE.';

const MISSION =
  'IS TO DELIGHT GUESTS WITH EXCEPTIONAL FOOD AND HEARTFELT HOSPITALITY, CREATING A SENSE OF COMMUNITY THAT BRINGS PEOPLE CLOSER TOGETHER.';

/** Our Story — dark theme with a gold accent line under the heading and
 *  gold-bordered content boxes. Text content unchanged. */
export default function AboutScreen() {
  const { open } = useAppMenu();

  return (
    <Screen scroll contentStyle={styles.content}>
      <Header title="OUR STORY" showBack onMenu={open} />

      <View style={styles.headingWrap}>
        <Text style={styles.pageTitle}>OUR STORY</Text>
        <View style={styles.rule} />
        <Text style={styles.tagline}>A REFINED DINING EXPERIENCE THAT STILL FEELS LIKE HOME.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.body}>{INTRO}</Text>
      </View>

      <Image source={imageOne} style={styles.photo} contentFit="cover" />

      <View style={styles.card}>
        <Text style={styles.body}>
          <Text style={styles.lead}>WE ENVISION </Text>
          {VISION}
        </Text>
      </View>

      <Image source={imageTwo} style={styles.photo} contentFit="cover" />

      <View style={styles.card}>
        <Text style={styles.body}>
          <Text style={styles.lead}>OUR MISSION </Text>
          {MISSION}
        </Text>
      </View>

      <Text style={styles.footer}>cafelocco.com</Text>
    </Screen>
  );
}

const H_PAD = Spacing.lg;

const styles = StyleSheet.create({
  content: { paddingHorizontal: H_PAD, paddingBottom: Spacing.xxl },
  headingWrap: { alignItems: 'center', marginTop: Spacing.xl, marginBottom: Spacing.lg },
  pageTitle: {
    fontFamily: Fonts.family,
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 4,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  rule: { width: 44, height: 1.5, backgroundColor: Colors.gold, marginTop: 12, marginBottom: 16 },
  tagline: {
    fontFamily: Fonts.family,
    fontWeight: '400',
    fontSize: 12.5,
    letterSpacing: 1.5,
    lineHeight: 20,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  // gold-bordered content box
  card: {
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    marginVertical: Spacing.md,
  },
  body: {
    fontFamily: Fonts.family,
    fontWeight: '300',
    fontSize: 13,
    letterSpacing: 1.4,
    lineHeight: 24,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  lead: { fontWeight: '700', color: Colors.gold },
  photo: { width: '100%', height: 220, borderRadius: Radius.lg, marginVertical: Spacing.md },
  footer: {
    fontFamily: Fonts.family,
    fontWeight: '400',
    fontSize: 12,
    letterSpacing: 1,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
});
