import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/ui/Screen';
import { Header } from '@/components/ui/Header';
import { Text } from '@/components/ui/Text';
import { useAppMenu, useReturnToMenuOnBack } from '@/components/AppMenu';
import { Colors } from '@/constants/colors';
import { Fonts, Spacing, Radius } from '@/constants/theme';
import { menu, MenuCategory, Diet } from '@/constants/menu';

const DIET_COLOR: Record<Diet, string> = {
  V: '#8FB996', // vegetarian – sage
  VG: '#7FB069', // vegan – green
  GF: '#9BB8D3', // gluten-free – soft blue
};

function DietBadges({ diet, size = 'sm' }: { diet?: Diet[]; size?: 'sm' | 'lg' }) {
  if (!diet || diet.length === 0) return null;
  return (
    <View style={styles.badgeRow}>
      {diet.map((d) => (
        <View key={d} style={[styles.badge, { borderColor: DIET_COLOR[d] }]}>
          <Text style={[styles.badgeText, { color: DIET_COLOR[d], fontSize: size === 'lg' ? 11 : 9 }]}>
            {d}
          </Text>
        </View>
      ))}
    </View>
  );
}

/** Menu — category tabs (with icons) + items; tap an item for the detail page. */
export default function MenuScreen() {
  const { open } = useAppMenu();
  useReturnToMenuOnBack();
  const [activeId, setActiveId] = useState(menu[0].id);

  const active = menu.find((c) => c.id === activeId) as MenuCategory;

  return (
    <Screen backgroundColor="#000">
      {/* Back arrow opens the side drawer (consistent with swipe-right on every
          page), rather than jumping to the home screen. */}
      <Header title="MENU" showBack onBack={open} onMenu={open} />

      {/* Category tab bar with icons */}
      <View style={styles.tabBarWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabBar}
        >
          {menu.map((category) => {
            const isActive = category.id === activeId;
            const color = isActive ? Colors.gold : Colors.textMuted;
            return (
              <Pressable key={category.id} onPress={() => setActiveId(category.id)} style={styles.tab}>
                <Ionicons name={category.icon} size={20} color={color} style={styles.tabIcon} />
                <Text variant="label" tracking={1.5} color={color} style={styles.tabLabel}>
                  {category.label}
                </Text>
                <View style={[styles.tabUnderline, isActive && styles.tabUnderlineActive]} />
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Items */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {active.note ? (
          <Text variant="caption" center tracking={1.5} color={Colors.textMuted} style={styles.catNote}>
            {active.note.toUpperCase()}
          </Text>
        ) : null}

        {active.items.map((item) => (
          <React.Fragment key={item.name}>
            {item.subheading ? (
              <Text style={styles.subheading}>{item.subheading}</Text>
            ) : null}
            <View style={styles.item}>
            <View style={styles.itemTop}>
              <Text variant="heading" tracking={1.5} color={Colors.white} style={styles.itemName}>
                {item.name}
              </Text>
              <Text style={styles.itemPrice}>£{item.price}</Text>
            </View>
            {item.description ? (
              <Text variant="body" color={Colors.textSecondary} style={styles.itemDesc} numberOfLines={3}>
                {item.description}
              </Text>
            ) : null}
            {item.note ? (
              <Text variant="caption" color={Colors.gold} style={styles.itemNote}>
                {item.note}
              </Text>
            ) : null}
            <DietBadges diet={item.diet} />
            </View>
          </React.Fragment>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabBarWrap: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  tabBar: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm, gap: Spacing.lg },
  tab: { alignItems: 'center', paddingTop: Spacing.sm },
  tabIcon: { marginBottom: 6 },
  tabLabel: { fontSize: 11 },
  tabUnderline: { marginTop: Spacing.sm, height: 2, width: '100%', borderRadius: Radius.pill, backgroundColor: 'transparent' },
  tabUnderlineActive: { backgroundColor: Colors.gold },

  list: { flex: 1 },
  listContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.xxl },
  catNote: { marginBottom: Spacing.lg },

  subheading: {
    fontFamily: Fonts.family,
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 2.5,
    color: Colors.white,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  item: { borderBottomWidth: 1, borderBottomColor: Colors.borderSubtle, paddingVertical: Spacing.lg },
  itemTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.md },
  itemName: { flex: 1 },
  itemPrice: { fontFamily: Fonts.family, fontWeight: '600', fontSize: 15, letterSpacing: 1, color: Colors.gold },
  itemDesc: { marginTop: Spacing.sm, fontSize: 13, lineHeight: 20 },
  itemNote: { marginTop: 6 },

  badgeRow: { flexDirection: 'row', gap: 6, marginTop: Spacing.sm },
  badge: { borderWidth: 1, borderRadius: Radius.sm, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText: { fontFamily: Fonts.family, fontWeight: '700', letterSpacing: 1 },
});
