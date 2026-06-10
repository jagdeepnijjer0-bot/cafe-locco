import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { Header } from '@/components/ui/Header';
import { Text } from '@/components/ui/Text';
import { useAppMenu } from '@/components/AppMenu';
import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/theme';
import { categories, menuItems } from '@/constants/menu';

/** Menu — genuine Cafe Locco menu: category tabs + items for the active category. */
export default function MenuScreen() {
  const { open } = useAppMenu();
  const [activeCategory, setActiveCategory] = useState('breakfast');

  const items = menuItems[activeCategory] ?? [];

  return (
    <Screen backgroundColor="#000">
      <Header title="MENU" showBack onMenu={open} />

      {/* Category tab bar */}
      <View style={styles.tabBarWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabBar}
        >
          {categories.map((category) => {
            const isActive = activeCategory === category.id;
            return (
              <Pressable
                key={category.id}
                onPress={() => setActiveCategory(category.id)}
                style={styles.tab}
              >
                <Text
                  variant="label"
                  tracking={2}
                  color={isActive ? Colors.gold : Colors.textMuted}
                  style={styles.tabLabel}
                >
                  {category.label}
                </Text>
                <View
                  style={[
                    styles.tabUnderline,
                    isActive && styles.tabUnderlineActive,
                  ]}
                />
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Menu items */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {items.map((item) => (
          <View key={item.name} style={styles.item}>
            <View style={styles.itemTop}>
              <Text
                variant="heading"
                tracking={2}
                color={Colors.white}
                style={styles.itemName}
              >
                {item.name}
              </Text>
              <Text
                variant="label"
                tracking={1}
                color={Colors.gold}
                style={styles.itemPrice}
              >
                £{item.price}
              </Text>
            </View>
            {item.description ? (
              <Text variant="body" color={Colors.textSecondary} style={styles.itemDesc}>
                {item.description}
              </Text>
            ) : null}
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabBarWrap: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tabBar: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    gap: Spacing.lg,
  },
  tab: {
    alignItems: 'center',
    paddingTop: Spacing.sm,
  },
  tabLabel: {
    fontSize: 12,
  },
  tabUnderline: {
    marginTop: Spacing.sm,
    height: 2,
    width: '100%',
    borderRadius: Radius.pill,
    backgroundColor: 'transparent',
  },
  tabUnderlineActive: {
    backgroundColor: Colors.gold,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  item: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
    paddingBottom: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  itemTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  itemName: {
    flex: 1,
  },
  itemPrice: {
    fontSize: 14,
  },
  itemDesc: {
    marginTop: Spacing.sm,
    fontSize: 13,
    lineHeight: 20,
  },
});
