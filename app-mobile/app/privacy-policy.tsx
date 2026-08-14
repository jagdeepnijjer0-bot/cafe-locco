import React from 'react';
import { View, StyleSheet } from 'react-native';

import { Screen } from '@/components/ui/Screen';
import { Header } from '@/components/ui/Header';
import { Text } from '@/components/ui/Text';
import { useAppMenu, useReturnToMenuOnBack } from '@/components/AppMenu';
import { Colors } from '@/constants/colors';
import { Fonts, Spacing } from '@/constants/theme';

type Block = { p: string } | { bullets: string[] };

interface Section {
  heading: string;
  blocks: Block[];
}

const LAST_UPDATED = 'Last updated: August 2026';

const SECTIONS: Section[] = [
  {
    heading: '1. Who We Are',
    blocks: [
      {
        p: 'Café Locco is a café and restaurant based at 139 Daventry Road, Coventry, CV3 5HD. This privacy policy explains how we collect and use your personal data through the Café Locco mobile app.',
      },
    ],
  },
  {
    heading: '2. What Data We Collect',
    blocks: [
      { p: 'When you use the Café Locco app, we may collect:' },
      {
        bullets: [
          'Your full name, email address, and phone number (when making a reservation or sending a contact message)',
          'Email address and password (if you create a membership account)',
          'Date, time, and number of guests for reservations',
          'Any special requests or messages you submit',
        ],
      },
    ],
  },
  {
    heading: '3. How We Use Your Data',
    blocks: [
      { p: 'We use your data to:' },
      {
        bullets: [
          'Process and confirm your table reservations',
          'Respond to your contact messages',
          'Manage your membership account if applicable',
          'Send you confirmation and notification emails',
        ],
      },
    ],
  },
  {
    heading: '4. Who We Share Your Data With',
    blocks: [
      { p: 'We do not sell your data. We use the following trusted third-party services to operate the app:' },
      {
        bullets: [
          'Supabase — secure database storage',
          'Resend — email delivery',
          'Stripe — payment processing (membership only)',
        ],
      },
    ],
  },
  {
    heading: '5. How Long We Keep Your Data',
    blocks: [
      {
        p: 'We retain your data for as long as necessary to provide our services, or as required by law. You may request deletion of your data at any time.',
      },
    ],
  },
  {
    heading: '6. Your Rights',
    blocks: [
      { p: 'Under UK GDPR you have the right to:' },
      {
        bullets: [
          'Access the personal data we hold about you',
          'Request correction or deletion of your data',
          'Object to how we process your data',
        ],
      },
      { p: 'To exercise any of these rights, contact us at: info@cafelocco.co.uk' },
    ],
  },
  {
    heading: '7. Data Security',
    blocks: [
      {
        p: 'Your data is stored securely using industry-standard encryption. We take reasonable steps to protect your information from unauthorised access.',
      },
    ],
  },
  {
    heading: '8. Contact',
    blocks: [
      { p: 'If you have any questions about this privacy policy, please contact us at:' },
      { p: 'info@cafelocco.co.uk' },
      { p: '139 Daventry Road, Coventry, CV3 5HD' },
    ],
  },
];

/** Privacy Policy — dark theme, gold accent line under the heading, matches
 *  the Our Story styling. Scrollable long-form legal content. */
export default function PrivacyPolicyScreen() {
  const { open } = useAppMenu();
  useReturnToMenuOnBack();

  return (
    <Screen scroll contentStyle={styles.content}>
      <Header title="PRIVACY POLICY" showBack onMenu={open} />

      <View style={styles.headingWrap}>
        <Text style={styles.pageTitle}>PRIVACY POLICY</Text>
        <View style={styles.rule} />
        <Text style={styles.updated}>{LAST_UPDATED}</Text>
      </View>

      {SECTIONS.map((section) => (
        <View key={section.heading} style={styles.section}>
          <Text style={styles.sectionHeading}>{section.heading}</Text>
          {section.blocks.map((block, bi) =>
            'p' in block ? (
              <Text key={bi} style={styles.body}>
                {block.p}
              </Text>
            ) : (
              <View key={bi} style={styles.bulletList}>
                {block.bullets.map((item, ii) => (
                  <View key={ii} style={styles.bulletRow}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={[styles.body, styles.bulletText]}>{item}</Text>
                  </View>
                ))}
              </View>
            ),
          )}
        </View>
      ))}

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
  updated: {
    fontFamily: Fonts.family,
    fontWeight: '400',
    fontSize: 12,
    letterSpacing: 1.5,
    color: Colors.textMuted,
    textAlign: 'center',
  },

  section: { marginTop: Spacing.lg },
  sectionHeading: {
    fontFamily: Fonts.family,
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 1.2,
    color: Colors.gold,
    marginBottom: Spacing.sm,
  },
  body: {
    fontFamily: Fonts.family,
    fontWeight: '300',
    fontSize: 13.5,
    letterSpacing: 0.4,
    lineHeight: 22,
    color: Colors.textSecondary,
  },

  bulletList: { marginTop: Spacing.xs },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  bulletDot: {
    fontFamily: Fonts.family,
    fontSize: 13.5,
    lineHeight: 22,
    color: Colors.gold,
    width: 16,
  },
  bulletText: { flex: 1 },

  footer: {
    fontFamily: Fonts.family,
    fontWeight: '400',
    fontSize: 12,
    letterSpacing: 1,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
});
